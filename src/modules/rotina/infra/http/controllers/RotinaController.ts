import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { CriarRotinaUseCase } from '../../../application/use-cases/CriarRotina/CriarRotinaUseCase';
import { AtualizarRotinaUseCase } from '../../../application/use-cases/AtualizarRotina/AtualizarRotinaUseCase';
import { ObterRotinaDoDiaUseCase } from '../../../application/use-cases/ObterRotinaDoDia/ObterRotinaDoDiaUseCase';
import { ConcluirPassoUseCase } from '../../../application/use-cases/ConcluirPasso/ConcluirPassoUseCase';
import { ObterEvolucaoClienteUseCase } from '../../../application/use-cases/ObterEvolucaoCliente/ObterEvolucaoClienteUseCase';
import { RotinaRepositoryPrisma } from '../../repositories/RotinaRepositoryPrisma';
import { RegistroDiarioRepositoryPrisma } from '../../repositories/RegistroDiarioRepositoryPrisma';
import { PontuacaoRepositoryPrisma } from '../../repositories/PontuacaoRepositoryPrisma';

export class RotinaController {
  private get rotinaRepo() { return new RotinaRepositoryPrisma(prisma); }
  private get registroRepo() { return new RegistroDiarioRepositoryPrisma(prisma); }
  private get pontuacaoRepo() { return new PontuacaoRepositoryPrisma(prisma); }

  async criar(req: Request, res: Response): Promise<void> {
    const useCase = new CriarRotinaUseCase(this.rotinaRepo);
    const result = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    const useCase = new AtualizarRotinaUseCase(this.rotinaRepo);
    const result = await useCase.executar({ rotinaId: req.params.id, ...req.body });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  async listarPorCliente(req: Request, res: Response): Promise<void> {
    const clienteId = new UniqueEntityID(String(req.params['clienteId']));
    const rotinas = await this.rotinaRepo.buscarAtivasPorCliente(clienteId);
    res.status(200).json(rotinas.map(r => ({
      id:          r.id.toString(),
      nome:        r.nome,
      descricao:   r.descricao,
      totalPassos: r.passos.filter(p => p.ativo).length,
    })));
  }

  async rotinaDoDia(req: Request, res: Response): Promise<void> {
    const useCase = new ObterRotinaDoDiaUseCase(this.rotinaRepo, this.registroRepo);
    const result = await useCase.executar({ clienteId: String(req.params['clienteId']) });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async concluirPasso(req: Request, res: Response): Promise<void> {
    const useCase = new ConcluirPassoUseCase(this.registroRepo, this.pontuacaoRepo);
    const result = await useCase.executar({
      registroDiarioId: String(req.params['registroId']),
      passoRotinaId:    String(req.params['passoId']),
      clienteId:        String(req.body.clienteId),
      fotoUrl:          req.body.fotoUrl ? String(req.body.fotoUrl) : undefined,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async evolucao(req: Request, res: Response): Promise<void> {
    const useCase = new ObterEvolucaoClienteUseCase(this.registroRepo, this.pontuacaoRepo);
    const limiteRaw = req.query.limite;
    const limite = limiteRaw ? parseInt(String(limiteRaw), 10) : 30;
    const result = await useCase.executar({ clienteId: String(req.params['id']), limite });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async registrarPushToken(req: Request, res: Response): Promise<void> {
    const { clienteId, token } = req.body as { clienteId: string; token: string };
    if (!clienteId || !token) {
      res.status(400).json({ error: 'clienteId e token são obrigatórios.' });
      return;
    }
    await prisma.pushToken.upsert({
      where: { token },
      create: { clienteId, token, ativo: true },
      update: { ativo: true },
    });
    res.status(200).json({ ok: true });
  }
}
