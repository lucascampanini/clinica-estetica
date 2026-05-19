import { Request, Response } from 'express';
import { prisma } from '@infra/database/prisma';
import { CobrancaRepositoryPrisma } from '../../repositories/CobrancaRepositoryPrisma';
import { CriarCobrancaUseCase } from '../../../application/use-cases/CriarCobranca/CriarCobrancaUseCase';
import { RegistrarPagamentoUseCase } from '../../../application/use-cases/RegistrarPagamento/RegistrarPagamentoUseCase';
import { ObterRelatorioUseCase } from '../../../application/use-cases/ObterRelatorio/ObterRelatorioUseCase';

export class FinanceiroController {
  private get repo() { return new CobrancaRepositoryPrisma(prisma); }

  async criarCobranca(req: Request, res: Response): Promise<void> {
    const result = await new CriarCobrancaUseCase(this.repo).executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }

  async registrarPagamento(req: Request, res: Response): Promise<void> {
    const result = await new RegistrarPagamentoUseCase(this.repo).executar({
      cobrancaId:     String(req.params['id']),
      formaPagamento: req.body.formaPagamento,
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json({ ok: true });
  }

  async relatorio(req: Request, res: Response): Promise<void> {
    const hoje = new Date().toISOString().slice(0, 10);
    const result = await new ObterRelatorioUseCase(this.repo).executar({
      clinicaId: String(req.params['clinicaId']),
      de:        String(req.query['de']  ?? hoje),
      ate:       String(req.query['ate'] ?? hoje),
    });
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async listar(req: Request, res: Response): Promise<void> {
    const hoje = new Date().toISOString().slice(0, 10);
    const repo = this.repo;
    const { UniqueEntityID } = await import('@shared/domain/UniqueEntityID');

    const cobranças = await repo.listar(
      new UniqueEntityID(String(req.params['clinicaId'])),
      new Date(String(req.query['de']  ?? hoje)),
      new Date(String(req.query['ate'] ?? hoje)),
    );

    res.status(200).json(
      cobranças.map(c => ({
        id:             c.id.toString(),
        agendamentoId:  c.agendamentoId.toString(),
        valor:          c.valor,
        formaPagamento: c.formaPagamento,
        status:         c.status,
        pagoEm:         c.pagoEm,
      })),
    );
  }
}
