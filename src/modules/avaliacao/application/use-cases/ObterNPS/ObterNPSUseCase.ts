import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import {
  IAvaliacaoRepository,
  ResumoNPS,
} from '@modules/avaliacao/domain/repositories/IAvaliacaoRepository';

interface Input {
  clinicaId: string;
  diasAtras?: number; // janela de tempo; padrão 90 dias
}

export class ObterNPSUseCase {
  constructor(private readonly repo: IAvaliacaoRepository) {}

  async executar(input: Input): Promise<Result<ResumoNPS>> {
    const resumo = await this.repo.calcularNPS(
      new UniqueEntityID(input.clinicaId),
      input.diasAtras ?? 90,
    );
    return Result.ok(resumo);
  }
}
