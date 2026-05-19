import { PrismaClient, Prisma, FormaPagamento as PrismaForma, StatusCobranca as PrismaStatus } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ICobrancaRepository, RelatorioFinanceiro } from '../../domain/repositories/ICobrancaRepository';
import { Cobranca, FormaPagamento, StatusCobranca } from '../../domain/entities/Cobranca';

export class CobrancaRepositoryPrisma implements ICobrancaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(c: Cobranca): Promise<void> {
    await this.prisma.cobranca.create({
      data: {
        id:             c.id.toString(),
        clinicaId:      c.clinicaId.toString(),
        agendamentoId:  c.agendamentoId.toString(),
        valor:          new Prisma.Decimal(c.valor),
        formaPagamento: c.formaPagamento as PrismaForma,
        status:         c.status as PrismaStatus,
        pagoEm:         c.pagoEm ?? null,
      },
    });
  }

  async atualizar(c: Cobranca): Promise<void> {
    await this.prisma.cobranca.update({
      where: { id: c.id.toString() },
      data: {
        formaPagamento: c.formaPagamento as PrismaForma,
        status:         c.status as PrismaStatus,
        pagoEm:         c.pagoEm ?? null,
      },
    });
  }

  async buscarPorId(id: UniqueEntityID): Promise<Cobranca | null> {
    const raw = await this.prisma.cobranca.findUnique({ where: { id: id.toString() } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async buscarPorAgendamento(agendamentoId: UniqueEntityID): Promise<Cobranca | null> {
    const raw = await this.prisma.cobranca.findUnique({
      where: { agendamentoId: agendamentoId.toString() },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listar(clinicaId: UniqueEntityID, de: Date, ate: Date): Promise<Cobranca[]> {
    const rows = await this.prisma.cobranca.findMany({
      where: { clinicaId: clinicaId.toString(), criadaEm: { gte: de, lte: ate } },
      orderBy: { criadaEm: 'desc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async relatorio(clinicaId: UniqueEntityID, de: Date, ate: Date): Promise<RelatorioFinanceiro> {
    const rows = await this.prisma.cobranca.findMany({
      where: { clinicaId: clinicaId.toString(), criadaEm: { gte: de, lte: ate } },
      select: { valor: true, status: true, formaPagamento: true },
    });

    let totalReceita   = 0;
    let totalPendente  = 0;
    let quantidadePago = 0;
    const porForma: Record<string, number> = {};

    for (const r of rows) {
      const valor = Number(r.valor);
      if (r.status === 'PAGO') {
        totalReceita   += valor;
        quantidadePago += 1;
        porForma[r.formaPagamento] = (porForma[r.formaPagamento] ?? 0) + valor;
      } else if (r.status === 'PENDENTE') {
        totalPendente += valor;
      }
    }

    return {
      totalReceita:      Math.round(totalReceita * 100) / 100,
      totalPendente:     Math.round(totalPendente * 100) / 100,
      quantidadePago,
      porFormaPagamento: porForma,
    };
  }

  private toDomain(raw: any): Cobranca {
    return Cobranca.reconstituir(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        agendamentoId:  new UniqueEntityID(raw.agendamentoId),
        valor:          Number(raw.valor),
        formaPagamento: raw.formaPagamento as FormaPagamento,
        status:         raw.status as StatusCobranca,
        pagoEm:         raw.pagoEm ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
