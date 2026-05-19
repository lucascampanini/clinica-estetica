import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import {
  IClienteRepository,
  ClienteAniversariante,
} from '../../domain/repositories/IClienteRepository';

export class ClienteRepositoryPrisma implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
}
