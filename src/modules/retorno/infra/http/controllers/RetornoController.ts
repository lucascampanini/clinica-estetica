import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { RetornoRepositoryPrisma } from '../../repositories/RetornoRepositoryPrisma';
import { AgendarRetornoUseCase } from '../../../application/use-cases/AgendarRetorno/AgendarRetornoUseCase';
import { ObterRetornosPendentesUseCase } from '../../../application/use-cases/ObterRetornosPendentes/ObterRetornosPendentesUseCase';
import { AtualizarStatusRetornoUseCase } from '../../../application/use-cases/AtualizarStatusRetorno/AtualizarStatusRetornoUseCase';

export class RetornoController {
  private get repo() { return new RetornoRepositoryPrisma(prisma); }

  // Esteticista: agenda retorno para cliente
  async agendar(req: Request, res: Response): Promise<void> {
    const useCase = new AgendarRetornoUseCase(this.repo);
    const result  = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  // Esteticista: painel de retornos pendentes
  async pendentes(req: Request, res: Response): Promise<void> {
    const useCase  = new ObterRetornosPendentesUseCase(this.repo);
    const result   = await useCase.executar({ clinicaId: String(req.params['clinicaId']) });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }

    const retornos = result.getValue();
    res.status(200).json(
      retornos.map(r => ({
        id:             r.id.toString(),
        clienteId:      r.clienteId.toString(),
        profissionalId: r.profissionalId.toString(),
        dataRetorno:    r.dataRetorno,
        observacao:     r.observacao,
        status:         r.status,
        lembrete7dias:  r.lembrete7dias,
        lembrete1dia:   r.lembrete1dia,
        criadoEm:      r.criadoEm,
      })),
    );
  }

  // Esteticista: atualiza status (AGENDADO, CANCELADO, etc.)
  async atualizarStatus(req: Request, res: Response): Promise<void> {
    const useCase = new AtualizarStatusRetornoUseCase(this.repo);
    const result  = await useCase.executar({
      retornoId: String(req.params['id']),
      status:    req.body.status,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }
}
