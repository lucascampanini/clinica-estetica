import { PrismaClient, Prisma } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IServicoRepository } from '../../domain/repositories/IServicoRepository';
import { Servico } from '../../domain/entities/Servico';

export class ServicoRepositoryPrisma implements IServicoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(servico: Servico): Promise<void> {
    await this.prisma.servico.create({
      data: {
        id:             servico.id.toString(),
        clinicaId:      servico.clinicaId.toString(),
        nome:           servico.nome,
        descricao:      servico.descricao ?? null,
        duracaoMinutos: servico.duracaoMinutos,
        preco:          new Prisma.Decimal(servico.preco),
        ativo:          servico.ativo,
      },
    });
  }

  async atualizar(servico: Servico): Promise<void> {
    await this.prisma.servico.update({
      where: { id: servico.id.toString() },
      data: {
        nome:           servico.nome,
        descricao:      servico.descricao ?? null,
        duracaoMinutos: servico.duracaoMinutos,
        preco:          new Prisma.Decimal(servico.preco),
        ativo:          servico.ativo,
      },
    });
  }

  async buscarPorId(id: UniqueEntityID): Promise<Servico | null> {
    const raw = await this.prisma.servico.findUnique({ where: { id: id.toString() } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listar(clinicaId: UniqueEntityID, apenasAtivos = true): Promise<Servico[]> {
    const rows = await this.prisma.servico.findMany({
      where: {
        clinicaId: clinicaId.toString(),
        ...(apenasAtivos ? { ativo: true } : {}),
      },
      orderBy: { nome: 'asc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(raw: any): Servico {
    return Servico.reconstituir(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        nome:           raw.nome,
        descricao:      raw.descricao ?? undefined,
        duracaoMinutos: raw.duracaoMinutos,
        preco:          Number(raw.preco),
        ativo:          raw.ativo,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
