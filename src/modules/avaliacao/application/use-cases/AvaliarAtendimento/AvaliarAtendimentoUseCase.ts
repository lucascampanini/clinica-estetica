import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IAvaliacaoRepository } from '@modules/avaliacao/domain/repositories/IAvaliacaoRepository';
import { AvaliacaoAtendimento } from '@modules/avaliacao/domain/entities/AvaliacaoAtendimento';

interface Input {
  clinicaId:   string;
  clienteId:   string;
  nota:        number;
  comentario?: string;
  servico?:    string;
}

type Output = { id: string };

export class AvaliarAtendimentoUseCase {
  constructor(private readonly repo: IAvaliacaoRepository) {}

  async executar(input: Input): Promise<Result<Output>> {
    const avaliacaoOrError = AvaliacaoAtendimento.criar({
      clinicaId:   new UniqueEntityID(input.clinicaId),
      clienteId:   new UniqueEntityID(input.clienteId),
      nota:        input.nota,
      comentario:  input.comentario,
      servico:     input.servico,
    });

    if (avaliacaoOrError.isFailure) {
      return Result.fail(avaliacaoOrError.getErrorValue());
    }

    const avaliacao = avaliacaoOrError.getValue();
    await this.repo.salvar(avaliacao);
    return Result.ok({ id: avaliacao.id.toString() });
  }
}
