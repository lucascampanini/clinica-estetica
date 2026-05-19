import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRetornoRepository } from '@modules/retorno/domain/repositories/IRetornoRepository';
import { RetornoRecomendado } from '@modules/retorno/domain/entities/RetornoRecomendado';

interface Input {
  clinicaId: string;
}

export class ObterRetornosPendentesUseCase {
  constructor(private readonly repo: IRetornoRepository) {}

  async executar(input: Input): Promise<Result<RetornoRecomendado[]>> {
    const retornos = await this.repo.listarPendentes(
      new UniqueEntityID(input.clinicaId),
    );
    return Result.ok(retornos);
  }
}
