import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { AgendamentoRepositoryPrisma } from '../../repositories/AgendamentoRepositoryPrisma';
import { CriarAgendamentoUseCase } from '../../../application/use-cases/CriarAgendamento/CriarAgendamentoUseCase';
import { AtualizarStatusAgendamentoUseCase } from '../../../application/use-cases/AtualizarStatus/AtualizarStatusAgendamentoUseCase';
import { ListarAgendamentosUseCase } from '../../../application/use-cases/ListarAgendamentos/ListarAgendamentosUseCase';

function mapAgendamento(a: any) {
  return {
    id:             a.id.toString(),
    clienteId:      a.clienteId.toString(),
    profissionalId: a.profissionalId.toString(),
    servicoId:      a.servicoId.toString(),
    inicio:         a.inicio,
    fim:            a.fim,
    status:         a.status,
    observacoes:    a.observacoes,
  };
}

export class AgendamentoController {
  private get repo() { return new AgendamentoRepositoryPrisma(prisma); }

  async criar(req: Request, res: Response): Promise<void> {
    const result = await new CriarAgendamentoUseCase(this.repo).executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async atualizarStatus(req: Request, res: Response): Promise<void> {
    const result = await new AtualizarStatusAgendamentoUseCase(this.repo).executar({
      agendamentoId: String(req.params['id']),
      status:        req.body.status,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  async listarPorDia(req: Request, res: Response): Promise<void> {
    const clinicaId = new UniqueEntityID(String(req.params['clinicaId']));
    const dataStr   = String(req.query['data'] ?? new Date().toISOString().slice(0, 10));
    const data      = new Date(dataStr + 'T12:00:00');
    const rows      = await this.repo.listarPorDiaDetalhado(clinicaId, data);
    res.status(200).json(rows);
  }

  async listarPorCliente(req: Request, res: Response): Promise<void> {
    const result = await new ListarAgendamentosUseCase(this.repo).executar({
      tipo:      'cliente',
      clienteId: String(req.params['clienteId']),
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue().map(mapAgendamento));
  }

  async listarPorProfissional(req: Request, res: Response): Promise<void> {
    const result = await new ListarAgendamentosUseCase(this.repo).executar({
      tipo:           'profissional',
      profissionalId: String(req.params['profissionalId']),
      data:           String(req.query['data'] ?? new Date().toISOString().slice(0, 10)),
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue().map(mapAgendamento));
  }
}
