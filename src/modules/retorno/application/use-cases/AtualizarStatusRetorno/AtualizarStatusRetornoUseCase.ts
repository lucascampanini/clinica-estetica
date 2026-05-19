import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRetornoRepository } from '@modules/retorno/domain/repositories/IRetornoRepository';
import { StatusRetorno } from '@modules/retorno/domain/entities/RetornoRecomendado';

interface Input {
  retornoId: string;
  status:    StatusRetorno;
}

const statusValidos: StatusRetorno[] = ['PENDENTE', 'AGENDADO', 'EXPIRADO', 'CANCELADO'];

export class AtualizarStatusRetornoUseCase {
  constructor(private readonly repo: IRetornoRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    if (!statusValidos.includes(input.status)) {
      return Result.fail(`Status inválido: ${input.status}`);
    }

    const retorno = await this.repo.buscarPorId(new UniqueEntityID(input.retornoId));
    if (!retorno) return Result.fail('Retorno não encontrado.');

    retorno.atualizarStatus(input.status);
    await this.repo.atualizar(retorno);
    return Result.ok(undefined);
  }
}
