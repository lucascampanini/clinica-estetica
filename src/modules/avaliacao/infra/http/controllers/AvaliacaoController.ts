import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { AvaliacaoRepositoryPrisma } from '../../repositories/AvaliacaoRepositoryPrisma';
import { AvaliarAtendimentoUseCase } from '../../../application/use-cases/AvaliarAtendimento/AvaliarAtendimentoUseCase';
import { ObterNPSUseCase } from '../../../application/use-cases/ObterNPS/ObterNPSUseCase';

export class AvaliacaoController {
  private get repo() { return new AvaliacaoRepositoryPrisma(prisma); }

  // Cliente: submete avaliação
  async avaliar(req: Request, res: Response): Promise<void> {
    const useCase = new AvaliarAtendimentoUseCase(this.repo);
    const result  = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  // Esteticista: dashboard NPS
  async nps(req: Request, res: Response): Promise<void> {
    const useCase = new ObterNPSUseCase(this.repo);
    const diasAtras = req.query['dias'] ? Number(req.query['dias']) : undefined;
    const result  = await useCase.executar({
      clinicaId: String(req.params['clinicaId']),
      diasAtras,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  // Esteticista: últimas avaliações com comentários
  async recentes(req: Request, res: Response): Promise<void> {
    const repo   = this.repo;
    const limite = req.query['limite'] ? Number(req.query['limite']) : 20;
    const { UniqueEntityID } = await import('@shared/domain/UniqueEntityID');
    const avaliacoes = await repo.listarRecentes(
      new UniqueEntityID(String(req.params['clinicaId'])),
      limite,
    );
    res.status(200).json(
      avaliacoes.map(a => ({
        id:         a.id.toString(),
        clienteId:  a.clienteId.toString(),
        nota:       a.nota,
        categoria:  a.categoria,
        comentario: a.comentario,
        servico:    a.servico,
        criadoEm:  a.criadoEm,
      })),
    );
  }
}
