import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ICobrancaRepository } from '@modules/financeiro/domain/repositories/ICobrancaRepository';
import { Cobranca, FormaPagamento } from '@modules/financeiro/domain/entities/Cobranca';

interface Input {
  clinicaId:      string;
  agendamentoId:  string;
  valor:          number;
  formaPagamento: FormaPagamento;
}

export class CriarCobrancaUseCase {
  constructor(private readonly repo: ICobrancaRepository) {}

  async executar(input: Input): Promise<Result<{ id: string }>> {
    const existente = await this.repo.buscarPorAgendamento(new UniqueEntityID(input.agendamentoId));
    if (existente) return Result.fail('Já existe uma cobrança para este agendamento.');

    const orError = Cobranca.criar({
      clinicaId:      new UniqueEntityID(input.clinicaId),
      agendamentoId:  new UniqueEntityID(input.agendamentoId),
      valor:          input.valor,
      formaPagamento: input.formaPagamento,
    });
    if (orError.isFailure) return Result.fail(orError.getErrorValue());

    const cobranca = orError.getValue();
    await this.repo.salvar(cobranca);
    return Result.ok({ id: cobranca.id.toString() });
  }
}
