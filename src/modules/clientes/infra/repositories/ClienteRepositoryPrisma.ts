import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import {
  IClienteRepository,
  ClienteAniversariante,
  ClienteResumo,
  CriarClienteInput,
} from '../../domain/repositories/IClienteRepository';

export class ClienteRepositoryPrisma implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async criar(input: CriarClienteInput): Promise<{ id: string }> {
    const cliente = await this.prisma.cliente.create({
      data: {
        clinicaId:      input.clinicaId,
        nome:           input.nome,
        telefone:       input.telefone,
        email:          input.email,
        cpf:            input.cpf,
        dataNascimento: input.dataNascimento ? new Date(input.dataNascimento) : undefined,
        observacoes:    input.observacoes,
        ...(input.anamnese ? {
          anamneses: { create: { conteudo: input.anamnese as object } },
        } : {}),
      },
    });
    return { id: cliente.id };
  }

  async buscarAniversariantesHoje(clinicaId: UniqueEntityID): Promise<ClienteAniversariante[]> {
    const hoje = new Date();
    const mes  = hoje.getMonth() + 1; // 1-12
    const dia  = hoje.getDate();

    // Filtra por mês e dia ignorando o ano (PostgreSQL)
    const rows = await this.prisma.$queryRaw<
      Array<{
        id:             string;
        nome:           string;
        telefone:       string;
        email:          string | null;
        datanascimento: Date;
      }>
    >`
      SELECT id, nome, telefone, email, "dataNascimento" AS datanascimento
      FROM clientes
      WHERE "clinicaId" = ${clinicaId.toString()}
        AND ativo = true
        AND "dataNascimento" IS NOT NULL
        AND EXTRACT(MONTH FROM "dataNascimento") = ${mes}
        AND EXTRACT(DAY   FROM "dataNascimento") = ${dia}
    `;

    return rows.map(r => ({
      id:             r.id,
      nome:           r.nome,
      telefone:       r.telefone,
      email:          r.email ?? undefined,
      dataNascimento: r.datanascimento,
      idade:          hoje.getFullYear() - r.datanascimento.getFullYear(),
    }));
  }

  async listar(clinicaId: UniqueEntityID, busca?: string): Promise<ClienteResumo[]> {
    const rows = await this.prisma.cliente.findMany({
      where: {
        clinicaId: clinicaId.toString(),
        ...(busca ? {
          OR: [
            { nome:     { contains: busca, mode: 'insensitive' } },
            { telefone: { contains: busca } },
            { email:    { contains: busca, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true, nome: true, telefone: true, email: true,
        dataNascimento: true, ativo: true, criadoEm: true,
      },
    });

    return rows.map(r => ({
      id:             r.id,
      nome:           r.nome,
      telefone:       r.telefone,
      email:          r.email ?? undefined,
      dataNascimento: r.dataNascimento ?? undefined,
      ativo:          r.ativo,
      criadoEm:      r.criadoEm,
    }));
  }
}
