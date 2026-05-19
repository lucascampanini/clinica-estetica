import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProfissionalRepository } from '@modules/profissional/domain/repositories/IProfissionalRepository';
import { Profissional } from '@modules/profissional/domain/entities/Profissional';

interface Input {
  clinicaId:     string;
  apenasAtivos?: boolean;
}

export class ListarProfissionaisUseCase {
  constructor(private readonly repo: IProfissionalRepository) {}

  async executar(input: Input): Promise<Result<Profissional[]>> {
    const lista = await this.repo.listar(
      new UniqueEntityID(input.clinicaId),
      input.apenasAtivos ?? true,
    );
    return Result.ok(lista);
  }
}
