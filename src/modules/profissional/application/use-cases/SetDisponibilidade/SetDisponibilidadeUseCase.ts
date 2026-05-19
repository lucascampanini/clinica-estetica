import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProfissionalRepository } from '@modules/profissional/domain/repositories/IProfissionalRepository';
import { DisponibilidadeSlot } from '@modules/profissional/domain/entities/Profissional';

interface Input {
  profissionalId: string;
  disponibilidades: DisponibilidadeSlot[];
}

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class SetDisponibilidadeUseCase {
  constructor(private readonly repo: IProfissionalRepository) {}

  async executar(input: Input): Promise<Result<void>> {
    for (const slot of input.disponibilidades) {
      if (slot.diaSemana < 0 || slot.diaSemana > 6) {
        return Result.fail('diaSemana deve ser entre 0 (dom) e 6 (sab).');
      }
      if (!HH_MM.test(slot.horaInicio) || !HH_MM.test(slot.horaFim)) {
        return Result.fail('horaInicio e horaFim devem estar no formato HH:MM.');
      }
      if (slot.horaInicio >= slot.horaFim) {
        return Result.fail('horaInicio deve ser anterior a horaFim.');
      }
    }

    const profissional = await this.repo.buscarPorId(new UniqueEntityID(input.profissionalId));
    if (!profissional) return Result.fail('Profissional não encontrado.');

    profissional.setDisponibilidades(input.disponibilidades);
    await this.repo.atualizar(profissional);
    return Result.ok(undefined);
  }
}
