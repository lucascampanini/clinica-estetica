import { PrismaClient, StatusAgendamento as PrismaStatus } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IAgendamentoRepository, AgendamentoDetalhado } from '../../domain/repositories/IAgendamentoRepository';
import { Agendamento, StatusAgendamento } from '../../domain/entities/Agendamento';

export class AgendamentoRepositoryPrisma implements IAgendamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(a: Agendamento): Promise<void> {
    await this.prisma.agendamento.create({
      data: {
        id:             a.id.toString(),
        clinicaId:      a.clinicaId.toString(),
        clienteId:      a.clienteId.toString(),
        profissionalId: a.profissionalId.toString(),
        servicoId:      a.servicoId.toString(),
        inicio:         a.inicio,
        fim:            a.fim,
        status:         a.status as PrismaStatus,
        observacoes:    a.observacoes ?? null,
      },
    });
  }

  async atualizar(a: Agendamento): Promise<void> {
    await this.prisma.agendamento.update({
      where: { id: a.id.toString() },
      data:  { status: a.status as PrismaStatus, observacoes: a.observacoes ?? null },
    });
  }

  async buscarPorId(id: UniqueEntityID): Promise<Agendamento | null> {
    const raw = await this.prisma.agendamento.findUnique({ where: { id: id.toString() } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listarPorDia(clinicaId: UniqueEntityID, data: Date): Promise<Agendamento[]> {
    const inicio = new Date(data); inicio.setHours(0, 0, 0, 0);
    const fim    = new Date(data); fim.setHours(23, 59, 59, 999);
    const rows = await this.prisma.agendamento.findMany({
      where: { clinicaId: clinicaId.toString(), inicio: { gte: inicio, lte: fim } },
      orderBy: { inicio: 'asc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async listarPorDiaDetalhado(clinicaId: UniqueEntityID, data: Date): Promise<AgendamentoDetalhado[]> {
    const inicio = new Date(data); inicio.setHours(0, 0, 0, 0);
    const fim    = new Date(data); fim.setHours(23, 59, 59, 999);
    const rows = await this.prisma.agendamento.findMany({
      where: { clinicaId: clinicaId.toString(), inicio: { gte: inicio, lte: fim } },
      orderBy: { inicio: 'asc' },
      include: {
        cliente:      { select: { nome: true, telefone: true } },
        profissional: { select: { nome: true } },
        servico:      { select: { nome: true } },
      },
    });
    return rows.map(r => ({
      id:               r.id,
      clienteId:        r.clienteId,
      clienteNome:      (r as any).cliente.nome,
      clienteTelefone:  (r as any).cliente.telefone,
      profissionalId:   r.profissionalId,
      profissionalNome: (r as any).profissional.nome,
      servicoId:        r.servicoId,
      servicoNome:      (r as any).servico.nome,
      inicio:           r.inicio,
      fim:              r.fim,
      status:           r.status,
      observacoes:      r.observacoes ?? undefined,
    }));
  }

  async listarPorCliente(clienteId: UniqueEntityID): Promise<Agendamento[]> {
    const rows = await this.prisma.agendamento.findMany({
      where:   { clienteId: clienteId.toString() },
      orderBy: { inicio: 'desc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async listarPorProfissional(profissionalId: UniqueEntityID, data: Date): Promise<Agendamento[]> {
    const inicio = new Date(data); inicio.setHours(0, 0, 0, 0);
    const fim    = new Date(data); fim.setHours(23, 59, 59, 999);
    const rows = await this.prisma.agendamento.findMany({
      where: { profissionalId: profissionalId.toString(), inicio: { gte: inicio, lte: fim } },
      orderBy: { inicio: 'asc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async buscarConflitos(
    profissionalId: UniqueEntityID,
    inicio: Date,
    fim: Date,
    excluirId?: UniqueEntityID,
  ): Promise<Agendamento[]> {
    const rows = await this.prisma.agendamento.findMany({
      where: {
        profissionalId: profissionalId.toString(),
        status:         { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
        inicio:         { lt: fim },
        fim:            { gt: inicio },
        ...(excluirId ? { id: { not: excluirId.toString() } } : {}),
      },
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(raw: any): Agendamento {
    return Agendamento.reconstituir(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        clienteId:      new UniqueEntityID(raw.clienteId),
        profissionalId: new UniqueEntityID(raw.profissionalId),
        servicoId:      new UniqueEntityID(raw.servicoId),
        inicio:         raw.inicio,
        fim:            raw.fim,
        status:         raw.status as StatusAgendamento,
        observacoes:    raw.observacoes ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
