import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { IRotinaRepository } from '@modules/rotina/domain/repositories/IRotinaRepository';
import { PassoRotina } from '@modules/rotina/domain/entities/PassoRotina';
import { PeriodoRotina } from '@modules/rotina/domain/enums/PeriodoRotina';
import { HorarioSugerido } from '@modules/rotina/domain/value-objects/HorarioSugerido';
import { PassoRotinaInputDTO } from '@modules/rotina/application/use-cases/CriarRotina/CriarRotinaDTO';

interface AtualizarRotinaDTO {
  rotinaId: string;
  profissionalId: string;
  nome?: string;
  descricao?: string;
  passosParaAdicionar?: PassoRotinaInputDTO[];
  passosParaRemover?: string[];
}

export class AtualizarRotinaUseCase {
  constructor(private readonly rotinaRepo: IRotinaRepository) {}

  public async executar(dto: AtualizarRotinaDTO): Promise<Result<void>> {
    const rotina = await this.rotinaRepo.buscarPorId(new UniqueEntityID(dto.rotinaId));
    if (!rotina) return Result.fail('Rotina não encontrada.');

    if (!rotina.profissionalId.equals(new UniqueEntityID(dto.profissionalId))) {
      return Result.fail('Apenas o profissional que criou a rotina pode alterá-la.');
    }

    for (const passoId of dto.passosParaRemover ?? []) {
      const result = rotina.removerPasso(new UniqueEntityID(passoId));
      if (result.isFailure) return result;
    }

    for (let i = 0; i < (dto.passosParaAdicionar ?? []).length; i++) {
      const p = dto.passosParaAdicionar![i];

      let horarioSugerido: HorarioSugerido | undefined;
      if (p.horarioSugerido) {
        const h = HorarioSugerido.criar(p.horarioSugerido);
        if (h.isFailure) return Result.fail(h.getErrorValue());
        horarioSugerido = h.getValue();
      }

      const passoOrError = PassoRotina.criar({
        rotinaId:       rotina.id,
        nome:           p.nome,
        produto:        p.produto,
        instrucoes:     p.instrucoes,
        periodo:        p.periodo as PeriodoRotina,
        horarioSugerido,
        diasSemana:     p.diasSemana ?? [],
        ordem:          rotina.passos.length + i,
      });
      if (passoOrError.isFailure) return Result.fail(passoOrError.getErrorValue());

      const addResult = rotina.adicionarPasso(passoOrError.getValue());
      if (addResult.isFailure) return addResult;
    }

    await this.rotinaRepo.atualizar(rotina);
    return Result.ok();
  }
}
