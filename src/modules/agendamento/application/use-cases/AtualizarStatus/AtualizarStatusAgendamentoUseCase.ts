import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IAgendamentoRepository } from '@modules/agendamento/domain/repositories/IAgendamentoRepository';
import { StatusAgendamento } from '@modules/agendamento/domain/entities/Agendamento';

interface Input {
  agendamentoId: string;
  status:        StatusAgendamento;
}

export class AtualizarStatusAgendamentoUseCase {
  constructor(private readonly repo: IAgendamentoRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    const agendamento = await this.repo.buscarPorId(new UniqueEntityID(input.agendamentoId));
    if (!agendamento) return Result.fail('Agendamento não encontrado.');

    let transicaoResult: Result<void>;
    switch (input.status) {
      case 'CONFIRMADO':      transicaoResult = agendamento.confirmar();      break;
      case 'CONCLUIDO':       transicaoResult = agendamento.concluir();       break;
      case 'CANCELADO':       transicaoResult = agendamento.cancelar();       break;
      case 'NAO_COMPARECEU':  transicaoResult = agendamento.naoCompareceu();  break;
      default:
        return Result.fail(`Status inválido: ${input.status}`);
    }

    if (transicaoResult.isFailure) return Result.fail(transicaoResult.getErrorValue());

    await this.repo.atualizar(agendamento);
    return Result.ok(undefined);
  }
}
