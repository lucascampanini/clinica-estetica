import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { ClienteRepositoryPrisma } from '../../repositories/ClienteRepositoryPrisma';
import { ObterAniversariantesHojeUseCase } from '../../../application/use-cases/ObterAniversariantesHoje/ObterAniversariantesHojeUseCase';

export class ClienteController {
  private get repo() { return new ClienteRepositoryPrisma(prisma); }

  // Esteticista: aniversariantes do dia
  async aniversariantesHoje(req: Request, res: Response): Promise<void> {
    const useCase = new ObterAniversariantesHojeUseCase(this.repo);
    const result  = await useCase.executar({ clinicaId: String(req.params['clinicaId']) });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }
}
