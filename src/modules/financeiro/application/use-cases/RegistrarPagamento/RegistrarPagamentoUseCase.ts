import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ICobrancaRepository } from '@modules/financeiro/domain/repositories/ICobrancaRepository';
import { FormaPagamento } from '@modules/financeiro/domain/entities/Cobranca';

interface Input {
  cobrancaId:     string;
  formaPagamento: FormaPagamento;
}

export class RegistrarPagamentoUseCase {
  constructor(private readonly repo: ICobrancaRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    const cobranca = await this.repo.buscarPorId(new UniqueEntityID(input.cobrancaId));
    if (!cobranca) return Result.fail('Cobrança não encontrada.');

    const resultado = cobranca.registrarPagamento(input.formaPagamento);
    if (resultado.isFailure) return Result.fail(resultado.getErrorValue());

    await this.repo.atualizar(cobranca);
    return Result.ok(undefined);
  }
}
