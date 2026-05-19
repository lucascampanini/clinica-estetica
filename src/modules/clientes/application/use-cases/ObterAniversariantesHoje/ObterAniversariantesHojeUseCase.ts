import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import {
  IClienteRepository,
  ClienteAniversariante,
} from '@modules/clientes/domain/repositories/IClienteRepository';

interface Input {
  clinicaId: string;
}

export class ObterAniversariantesHojeUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async executar(input: Input): Promise<Result<ClienteAniversariante[]>> {
    const aniversariantes = await this.repo.buscarAniversariantesHoje(
      new UniqueEntityID(input.clinicaId),
    );
    return Result.ok(aniversariantes);
  }
}
