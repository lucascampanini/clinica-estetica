import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { ServicoRepositoryPrisma } from '../../repositories/ServicoRepositoryPrisma';
import { CriarServicoUseCase } from '../../../application/use-cases/CriarServico/CriarServicoUseCase';
import { AtualizarServicoUseCase } from '../../../application/use-cases/AtualizarServico/AtualizarServicoUseCase';
import { ListarServicosUseCase } from '../../../application/use-cases/ListarServicos/ListarServicosUseCase';
import { DesativarServicoUseCase } from '../../../application/use-cases/DesativarServico/DesativarServicoUseCase';

export class CatalogoController {
  private get repo() { return new ServicoRepositoryPrisma(prisma); }

  async criar(req: Request, res: Response): Promise<void> {
    const result = await new CriarServicoUseCase(this.repo).executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    const result = await new AtualizarServicoUseCase(this.repo).executar({
      servicoId: String(req.params['id']),
      ...req.body,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  async listar(req: Request, res: Response): Promise<void> {
    const apenasAtivos = req.query['todos'] !== 'true';
    const result = await new ListarServicosUseCase(this.repo).executar({
      clinicaId:    String(req.params['clinicaId']),
      apenasAtivos,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }

    res.status(200).json(
      result.getValue().map(s => ({
        id:             s.id.toString(),
        nome:           s.nome,
        descricao:      s.descricao,
        duracaoMinutos: s.duracaoMinutos,
        preco:          s.preco,
        ativo:          s.ativo,
      })),
    );
  }

  async desativar(req: Request, res: Response): Promise<void> {
    const result = await new DesativarServicoUseCase(this.repo).executar(String(req.params['id']));
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }
}
