import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ICobrancaRepository, RelatorioFinanceiro } from '@modules/financeiro/domain/repositories/ICobrancaRepository';

interface Input {
  clinicaId: string;
  de:        string; // YYYY-MM-DD
  ate:       string; // YYYY-MM-DD
}

export class ObterRelatorioUseCase {
  constructor(private readonly repo: ICobrancaRepository) {}

  async executar(input: Input): Promise<Result<RelatorioFinanceiro>> {
    const de  = new Date(input.de);
    const ate = new Date(input.ate); ate.setHours(23, 59, 59, 999);

    const relatorio = await this.repo.relatorio(new UniqueEntityID(input.clinicaId), de, ate);
    return Result.ok(relatorio);
  }
}
