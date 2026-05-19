import { PrismaClient, StatusRetorno as PrismaStatusRetorno } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRetornoRepository } from '../../domain/repositories/IRetornoRepository';
import { RetornoRecomendado, StatusRetorno } from '../../domain/entities/RetornoRecomendado';

export class RetornoRepositoryPrisma implements IRetornoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(retorno: RetornoRecomendado): Promise<void> {
    await this.prisma.retornoRecomendado.create({
      data: {
        id:             retorno.id.toString(),
        clinicaId:      retorno.clinicaId.toString(),
        clienteId:      retorno.clienteId.toString(),
        profissionalId: retorno.profissionalId.toString(),
        dataRetorno:    retorno.dataRetorno,
        observacao:     retorno.observacao ?? null,
        status:         retorno.status as PrismaStatusRetorno,
        lembrete7dias:  retorno.lembrete7dias,
        lembrete1dia:   retorno.lembrete1dia,
      },
    });
  }

  async atualizar(retorno: RetornoRecomendado): Promise<void> {
    await this.prisma.retornoRecomendado.update({
      where: { id: retorno.id.toString() },
      data: {
        status:        retorno.status as PrismaStatusRetorno,
        lembrete7dias: retorno.lembrete7dias,
        lembrete1dia:  retorno.lembrete1dia,
        observacao:    retorno.observacao ?? null,
      },
    });
  }

  async buscarPorId(id: UniqueEntityID): Promise<RetornoRecomendado | null> {
    const raw = await this.prisma.retornoRecomendado.findUnique({ where: { id: id.toString() } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listarPendentes(clinicaId: UniqueEntityID): Promise<RetornoRecomendado[]> {
    const rows = await this.prisma.retornoRecomendado.findMany({
      where: {
        clinicaId: clinicaId.toString(),
        status:    'PENDENTE',
        dataRetorno: { gte: new Date() },
      },
      orderBy: { dataRetorno: 'asc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async buscarParaLembrete(diasRestantes: 1 | 7): Promise<RetornoRecomendado[]> {
    const alvo = new Date();
    alvo.setDate(alvo.getDate() + diasRestantes);
    alvo.setHours(0, 0, 0, 0);
    const fimAlvo = new Date(alvo);
    fimAlvo.setHours(23, 59, 59, 999);

    const campoFlag = diasRestantes === 7 ? 'lembrete7dias' : 'lembrete1dia';

    const rows = await this.prisma.retornoRecomendado.findMany({
      where: {
        status:      'PENDENTE',
        dataRetorno: { gte: alvo, lte: fimAlvo },
        [campoFlag]: false,
      },
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(raw: any): RetornoRecomendado {
    return RetornoRecomendado.reconstituir(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        clienteId:      new UniqueEntityID(raw.clienteId),
        profissionalId: new UniqueEntityID(raw.profissionalId),
        dataRetorno:    raw.dataRetorno,
        observacao:     raw.observacao ?? undefined,
        status:         raw.status as StatusRetorno,
        lembrete7dias:  raw.lembrete7dias,
        lembrete1dia:   raw.lembrete1dia,
        criadoEm:      raw.criadoEm,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
