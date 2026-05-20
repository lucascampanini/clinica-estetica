import { Result } from '@shared/core/Result';
import { IClienteRepository, CriarClienteInput } from '@modules/clientes/domain/repositories/IClienteRepository';

export class CriarClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async executar(input: CriarClienteInput): Promise<Result<{ id: string }>> {
    if (!input.nome?.trim())     return Result.fail('Nome é obrigatório.');
    if (!input.telefone?.trim()) return Result.fail('Telefone é obrigatório.');
    if (!input.clinicaId)        return Result.fail('Clínica não identificada.');
    if (!input.anamnese?.lgpdConsent) return Result.fail('Consentimento LGPD é obrigatório.');

    const resultado = await this.repo.criar(input);
    return Result.ok(resultado);
  }
}
