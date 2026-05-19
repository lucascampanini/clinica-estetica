import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import {
  IAvaliacaoRepository,
  ResumoNPS,
} from '../../domain/repositories/IAvaliacaoRepository';
import { AvaliacaoAtendimento } from '../../domain/entities/AvaliacaoAtendimento';

export class AvaliacaoRepositoryPrisma implements IAvaliacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(avaliacao: AvaliacaoAtendimento): Promise<void> {
    await this.prisma.avaliacaoAtendimento.create({
      data: {
        id:         avaliacao.id.toString(),
        clinicaId:  avaliacao.clinicaId.toString(),
        clienteId:  avaliacao.clienteId.toString(),
        nota:       avaliacao.nota,
        comentario: avaliacao.comentario ?? null,
        servico:    avaliacao.servico ?? null,
      },
    });
  }

  async calcularNPS(clinicaId: UniqueEntityID, diasAtras = 90): Promise<ResumoNPS> {
    const desde = new Date();
    desde.setDate(desde.getDate() - diasAtras);

    const rows = await this.prisma.avaliacaoAtendimento.findMany({
      where: { clinicaId: clinicaId.toString(), criadoEm: { gte: desde } },
      select: { nota: true },
    });

    const total = rows.length;
    if (total === 0) {
      return { total: 0, promotores: 0, neutros: 0, detratores: 0, nps: 0, mediaNota: 0 };
    }

    const promotores  = rows.filter(r => r.nota === 5).length;
    const detratores  = rows.filter(r => r.nota <= 2).length;
    const neutros     = total - promotores - detratores;
    const nps         = Math.round(((promotores - detratores) / total) * 100);
    const mediaNota   = rows.reduce((s, r) => s + r.nota, 0) / total;

    return { total, promotores, neutros, detratores, nps, mediaNota: Math.round(mediaNota * 10) / 10 };
  }

  async listarRecentes(clinicaId: UniqueEntityID, limite: number): Promise<AvaliacaoAtendimento[]> {
    const rows = await this.prisma.avaliacaoAtendimento.findMany({
      where:   { clinicaId: clinicaId.toString() },
      orderBy: { criadoEm: 'desc' },
      take:    limite,
    });
    return rows.map(r =>
      AvaliacaoAtendimento.reconstituir(
        {
          clinicaId:   new UniqueEntityID(r.clinicaId),
          clienteId:   new UniqueEntityID(r.clienteId),
          nota:        r.nota,
          comentario:  r.comentario ?? undefined,
          servico:     r.servico ?? undefined,
          criadoEm:   r.criadoEm,
        },
        new UniqueEntityID(r.id),
      ),
    );
  }
}
