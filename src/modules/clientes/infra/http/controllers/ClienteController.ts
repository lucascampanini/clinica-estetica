import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
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

  // Esteticista: lista todos os clientes com busca opcional
  async listar(req: Request, res: Response): Promise<void> {
    const busca = req.query['busca'] ? String(req.query['busca']) : undefined;
    const clientes = await this.repo.listar(
      new UniqueEntityID(String(req.params['clinicaId'])),
      busca,
    );
    res.status(200).json(clientes);
  }
}
