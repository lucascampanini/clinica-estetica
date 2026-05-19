import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProfissionalRepository } from '@modules/profissional/domain/repositories/IProfissionalRepository';

interface Input {
  profissionalId: string;
  nome?:          string;
  especialidade?: string;
  telefone?:      string;
}

export class AtualizarProfissionalUseCase {
  constructor(private readonly repo: IProfissionalRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    const profissional = await this.repo.buscarPorId(new UniqueEntityID(input.profissionalId));
    if (!profissional) return Result.fail('Profissional não encontrado.');

    profissional.atualizar({
      nome:          input.nome,
      especialidade: input.especialidade,
      telefone:      input.telefone,
    });

    await this.repo.atualizar(profissional);
    return Result.ok(undefined);
  }
}
