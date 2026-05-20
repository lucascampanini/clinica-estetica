import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ClienteRepositoryPrisma } from '../../repositories/ClienteRepositoryPrisma';
import { ObterAniversariantesHojeUseCase } from '../../../application/use-cases/ObterAniversariantesHoje/ObterAniversariantesHojeUseCase';
import { CriarClienteUseCase } from '../../../application/use-cases/CriarCliente/CriarClienteUseCase';

export class ClienteController {
  private get repo() { return new ClienteRepositoryPrisma(prisma); }

  async criar(req: Request, res: Response): Promise<void> {
    const useCase = new CriarClienteUseCase(this.repo);
    const result  = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async aniversariantesHoje(req: Request, res: Response): Promise<void> {
    const useCase = new ObterAniversariantesHojeUseCase(this.repo);
    const result  = await useCase.executar({ clinicaId: String(req.params['clinicaId']) });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async listar(req: Request, res: Response): Promise<void> {
    const busca = req.query['busca'] ? String(req.query['busca']) : undefined;
    const clientes = await this.repo.listar(
      new UniqueEntityID(String(req.params['clinicaId'])),
      busca,
    );
    res.status(200).json(clientes);
  }
}
