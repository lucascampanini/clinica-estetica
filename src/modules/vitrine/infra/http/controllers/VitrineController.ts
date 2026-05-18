import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { CadastrarProdutoUseCase } from '../../../application/use-cases/CadastrarProduto/CadastrarProdutoUseCase';
import { AtualizarProdutoUseCase } from '../../../application/use-cases/AtualizarProduto/AtualizarProdutoUseCase';
import { ListarProdutosUseCase } from '../../../application/use-cases/ListarProdutos/ListarProdutosUseCase';
import { RegistrarCliqueUseCase } from '../../../application/use-cases/RegistrarClique/RegistrarCliqueUseCase';
import { ProdutoVitrineRepositoryPrisma } from '../../repositories/ProdutoVitrineRepositoryPrisma';

export class VitrineController {
  private get repo() { return new ProdutoVitrineRepositoryPrisma(prisma); }

  // Esteticista: cadastra produto
  async cadastrar(req: Request, res: Response): Promise<void> {
    const useCase = new CadastrarProdutoUseCase(this.repo);
    const result = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  // Esteticista: atualiza produto
  async atualizar(req: Request, res: Response): Promise<void> {
    const useCase = new AtualizarProdutoUseCase(this.repo);
    const result = await useCase.executar({ produtoId: String(req.params['id']), ...req.body });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  // Esteticista: vê todos os produtos + métricas de cliques
  async listarMaster(req: Request, res: Response): Promise<void> {
    const useCase = new ListarProdutosUseCase(this.repo);
    const result = await useCase.executar({
      clinicaId:    String(req.params['clinicaId']),
      apenasAtivos: false,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  // Cliente: vê apenas produtos ativos (sem métricas)
  async listarVitrine(req: Request, res: Response): Promise<void> {
    const useCase = new ListarProdutosUseCase(this.repo);
    const result = await useCase.executar({
      clinicaId:    String(req.params['clinicaId']),
      apenasAtivos: true,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  // Cliente: clica em "Comprar" → registra clique e redireciona
  async redirecionar(req: Request, res: Response): Promise<void> {
    const useCase = new RegistrarCliqueUseCase(this.repo);
    const result = await useCase.executar({
      produtoId: String(req.params['id']),
      clienteId: req.query['clienteId'] ? String(req.query['clienteId']) : undefined,
    });
    if (result.isFailure) {
      res.status(404).json({ error: result.getErrorValue() });
      return;
    }
    // Redirect 302 para o link parceiro — o browser vai direto para a loja
    res.redirect(302, result.getValue().urlRedirect);
  }
}
