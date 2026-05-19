import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProfissionalRepository } from '@modules/profissional/domain/repositories/IProfissionalRepository';
import { Profissional } from '@modules/profissional/domain/entities/Profissional';

interface Input {
  clinicaId:     string;
  nome:          string;
  especialidade?: string;
  telefone?:     string;
}

export class CriarProfissionalUseCase {
  constructor(private readonly repo: IProfissionalRepository) {}

  async executar(input: Input): Promise<Result<{ id: string }>> {
    const orError = Profissional.criar({
      clinicaId:     new UniqueEntityID(input.clinicaId),
      nome:          input.nome,
      especialidade: input.especialidade,
      telefone:      input.telefone,
    });
    if (orError.isFailure) return Result.fail(orError.getErrorValue());

    const profissional = orError.getValue();
    await this.repo.salvar(profissional);
    return Result.ok({ id: profissional.id.toString() });
  }
}
