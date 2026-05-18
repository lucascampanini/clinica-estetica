import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { DomainEvents } from '@shared/domain/events/DomainEvents';
import { Rotina } from '@modules/rotina/domain/entities/Rotina';
import { PassoRotina } from '@modules/rotina/domain/entities/PassoRotina';
import { PeriodoRotina } from '@modules/rotina/domain/enums/PeriodoRotina';
import { HorarioSugerido } from '@modules/rotina/domain/value-objects/HorarioSugerido';
import { IRotinaRepository } from '@modules/rotina/domain/repositories/IRotinaRepository';
import { CriarRotinaDTO } from './CriarRotinaDTO';

interface CriarRotinaResponse {
  rotinaId: string;
}

export class CriarRotinaUseCase {
  constructor(private readonly rotinaRepo: IRotinaRepository) {}

  public async executar(dto: CriarRotinaDTO): Promise<Result<CriarRotinaResponse>> {
    const rotinaOrError = Rotina.criar({
      clinicaId:      new UniqueEntityID(dto.clinicaId),
      clienteId:      new UniqueEntityID(dto.clienteId),
      profissionalId: new UniqueEntityID(dto.profissionalId),
      nome:           dto.nome,
      descricao:      dto.descricao,
    });
    if (rotinaOrError.isFailure) return Result.fail(rotinaOrError.getErrorValue());

    const rotina = rotinaOrError.getValue();

    for (let i = 0; i < dto.passos.length; i++) {
      const p = dto.passos[i];

      let horarioSugerido: HorarioSugerido | undefined;
      if (p.horarioSugerido) {
        const horarioOrError = HorarioSugerido.criar(p.horarioSugerido);
        if (horarioOrError.isFailure) return Result.fail(horarioOrError.getErrorValue());
        horarioSugerido = horarioOrError.getValue();
      }

      const passoOrError = PassoRotina.criar({
        rotinaId:       rotina.id,
        nome:           p.nome,
        produto:        p.produto,
        instrucoes:     p.instrucoes,
        periodo:        p.periodo as PeriodoRotina,
        horarioSugerido,
        diasSemana:     p.diasSemana ?? [],
        ordem:          p.ordem ?? i,
      });
      if (passoOrError.isFailure) return Result.fail(passoOrError.getErrorValue());

      const addResult = rotina.adicionarPasso(passoOrError.getValue());
      if (addResult.isFailure) return Result.fail(addResult.getErrorValue());
    }

    await this.rotinaRepo.salvar(rotina);
    DomainEvents.dispatchEventsForAggregate(rotina.id);

    return Result.ok({ rotinaId: rotina.id.toString() });
  }
}
