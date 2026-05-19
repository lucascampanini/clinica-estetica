import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { ProfissionalRepositoryPrisma } from '../../repositories/ProfissionalRepositoryPrisma';
import { CriarProfissionalUseCase } from '../../../application/use-cases/CriarProfissional/CriarProfissionalUseCase';
import { AtualizarProfissionalUseCase } from '../../../application/use-cases/AtualizarProfissional/AtualizarProfissionalUseCase';
import { ListarProfissionaisUseCase } from '../../../application/use-cases/ListarProfissionais/ListarProfissionaisUseCase';
import { SetDisponibilidadeUseCase } from '../../../application/use-cases/SetDisponibilidade/SetDisponibilidadeUseCase';

export class ProfissionalController {
  private get repo() { return new ProfissionalRepositoryPrisma(prisma); }

  async criar(req: Request, res: Response): Promise<void> {
    const result = await new CriarProfissionalUseCase(this.repo).executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    const result = await new AtualizarProfissionalUseCase(this.repo).executar({
      profissionalId: String(req.params['id']),
      ...req.body,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  async listar(req: Request, res: Response): Promise<void> {
    const apenasAtivos = req.query['todos'] !== 'true';
    const result = await new ListarProfissionaisUseCase(this.repo).executar({
      clinicaId:    String(req.params['clinicaId']),
      apenasAtivos,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }

    res.status(200).json(
      result.getValue().map(p => ({
        id:              p.id.toString(),
        nome:            p.nome,
        especialidade:   p.especialidade,
        telefone:        p.telefone,
        ativo:           p.ativo,
        disponibilidades: p.disponibilidades,
      })),
    );
  }

  async setDisponibilidade(req: Request, res: Response): Promise<void> {
    const result = await new SetDisponibilidadeUseCase(this.repo).executar({
      profissionalId:  String(req.params['id']),
      disponibilidades: req.body.disponibilidades,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }
}
