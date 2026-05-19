import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IServicoRepository } from '@modules/catalogo/domain/repositories/IServicoRepository';
import { Servico } from '@modules/catalogo/domain/entities/Servico';

interface Input {
  clinicaId:      string;
  nome:           string;
  descricao?:     string;
  duracaoMinutos: number;
  preco:          number;
}

export class CriarServicoUseCase {
  constructor(private readonly repo: IServicoRepository) {}

  async executar(input: Input): Promise<Result<{ id: string }>> {
    const servicoOrError = Servico.criar({
      clinicaId:      new UniqueEntityID(input.clinicaId),
      nome:           input.nome,
      descricao:      input.descricao,
      duracaoMinutos: input.duracaoMinutos,
      preco:          input.preco,
    });
    if (servicoOrError.isFailure) return Result.fail(servicoOrError.getErrorValue());

    const servico = servicoOrError.getValue();
    await this.repo.salvar(servico);
    return Result.ok({ id: servico.id.toString() });
  }
}
