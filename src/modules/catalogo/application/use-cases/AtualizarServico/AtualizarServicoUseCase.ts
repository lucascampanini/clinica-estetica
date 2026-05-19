import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IServicoRepository } from '@modules/catalogo/domain/repositories/IServicoRepository';

interface Input {
  servicoId:       string;
  nome?:           string;
  descricao?:      string;
  duracaoMinutos?: number;
  preco?:          number;
}

export class AtualizarServicoUseCase {
  constructor(private readonly repo: IServicoRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    const servico = await this.repo.buscarPorId(new UniqueEntityID(input.servicoId));
    if (!servico) return Result.fail('Serviço não encontrado.');

    servico.atualizar({
      nome:           input.nome,
      descricao:      input.descricao,
      duracaoMinutos: input.duracaoMinutos,
      preco:          input.preco,
    });

    await this.repo.atualizar(servico);
    return Result.ok(undefined);
  }
}
