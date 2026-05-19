import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRetornoRepository } from '@modules/retorno/domain/repositories/IRetornoRepository';
import { RetornoRecomendado } from '@modules/retorno/domain/entities/RetornoRecomendado';

interface Input {
  clinicaId:      string;
  clienteId:      string;
  profissionalId: string;
  dataRetorno:    string; // ISO date string
  observacao?:    string;
}

type Output = { id: string };

export class AgendarRetornoUseCase {
  constructor(private readonly repo: IRetornoRepository) {}

  async executar(input: Input): Promise<Result<Output>> {
    const retornoOrError = RetornoRecomendado.criar({
      clinicaId:      new UniqueEntityID(input.clinicaId),
      clienteId:      new UniqueEntityID(input.clienteId),
      profissionalId: new UniqueEntityID(input.profissionalId),
      dataRetorno:    new Date(input.dataRetorno),
      observacao:     input.observacao,
    });

    if (retornoOrError.isFailure) {
      return Result.fail(retornoOrError.getErrorValue());
    }

    const retorno = retornoOrError.getValue();
    await this.repo.salvar(retorno);
    return Result.ok({ id: retorno.id.toString() });
  }
}
