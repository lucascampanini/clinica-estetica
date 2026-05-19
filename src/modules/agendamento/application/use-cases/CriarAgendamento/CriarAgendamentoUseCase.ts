import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IAgendamentoRepository } from '@modules/agendamento/domain/repositories/IAgendamentoRepository';
import { Agendamento } from '@modules/agendamento/domain/entities/Agendamento';

interface Input {
  clinicaId:      string;
  clienteId:      string;
  profissionalId: string;
  servicoId:      string;
  inicio:         string; // ISO datetime
  fim:            string; // ISO datetime
  observacoes?:   string;
}

export class CriarAgendamentoUseCase {
  constructor(private readonly repo: IAgendamentoRepository) {}

  async executar(input: Input): Promise<Result<{ id: string }>> {
    const inicio = new Date(input.inicio);
    const fim    = new Date(input.fim);

    const orError = Agendamento.criar({
      clinicaId:      new UniqueEntityID(input.clinicaId),
      clienteId:      new UniqueEntityID(input.clienteId),
      profissionalId: new UniqueEntityID(input.profissionalId),
      servicoId:      new UniqueEntityID(input.servicoId),
      inicio,
      fim,
      observacoes:    input.observacoes,
    });
    if (orError.isFailure) return Result.fail(orError.getErrorValue());

    // Verifica conflito de horário
    const conflitos = await this.repo.buscarConflitos(
      new UniqueEntityID(input.profissionalId),
      inicio,
      fim,
    );
    if (conflitos.length > 0) {
      return Result.fail('Profissional já possui agendamento nesse horário.');
    }

    const agendamento = orError.getValue();
    await this.repo.salvar(agendamento);
    return Result.ok({ id: agendamento.id.toString() });
  }
}
