import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { DomainEvents } from '@shared/domain/events/DomainEvents';
import { IRotinaRepository } from '@modules/rotina/domain/repositories/IRotinaRepository';
import { IRegistroDiarioRepository } from '@modules/rotina/domain/repositories/IRegistroDiarioRepository';
import { RegistroDiario } from '@modules/rotina/domain/entities/RegistroDiario';
import { PassoRotina } from '@modules/rotina/domain/entities/PassoRotina';

interface ObterRotinaDoDiaDTO {
  clienteId: string;
}

export interface PassoDoDiaDTO {
  passoRotinaId: string;
  nome: string;
  produto?: string;
  instrucoes?: string;
  periodo: string;
  horarioSugerido?: string;
  concluido: boolean;
  concluidoEm?: Date;
}

export interface RotinaDoDiaDTO {
  rotinaId: string;
  registroDiarioId: string;
  nomeRotina: string;
  data: Date;
  passos: PassoDoDiaDTO[];
  percentualConcluido: number;
  estrelasGanhas: number;
  fotosUrl: string[];
}

export class ObterRotinaDoDiaUseCase {
  constructor(
    private readonly rotinaRepo: IRotinaRepository,
    private readonly registroRepo: IRegistroDiarioRepository,
  ) {}

  public async executar(dto: ObterRotinaDoDiaDTO): Promise<Result<RotinaDoDiaDTO | null>> {
    const clienteId = new UniqueEntityID(dto.clienteId);
    const rotinas = await this.rotinaRepo.buscarAtivasPorCliente(clienteId);

    if (rotinas.length === 0) return Result.ok(null);

    const rotina = rotinas[0];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = hoje.getDay();

    const passosHoje: PassoRotina[] = rotina.passosParaHoje(diaSemana);
    if (passosHoje.length === 0) return Result.ok(null);

    let registro = await this.registroRepo.buscarPorRotinaEData(rotina.id, hoje);

    if (!registro) {
      const registroOrError = RegistroDiario.criar({
        rotinaId:    rotina.id,
        clienteId,
        data:        hoje,
        totalPassos: passosHoje.length,
        passosDodia: passosHoje.map((p: PassoRotina) => p.id),
      });
      if (registroOrError.isFailure) return Result.fail(registroOrError.getErrorValue());

      registro = registroOrError.getValue();
      await this.registroRepo.salvar(registro);
      DomainEvents.dispatchEventsForAggregate(registro.id);
    }

    const reg = registro;
    const passosMapeados: PassoDoDiaDTO[] = passosHoje.map((passo: PassoRotina) => {
      const item = reg.checklist.find(
        (i: { passoRotinaId: UniqueEntityID }) => i.passoRotinaId.equals(passo.id),
      );
      return {
        passoRotinaId:   passo.id.toString(),
        nome:            passo.nome,
        produto:         passo.produto,
        instrucoes:      passo.instrucoes,
        periodo:         passo.periodo,
        horarioSugerido: passo.horarioSugerido?.valor,
        concluido:       item?.concluido ?? false,
        concluidoEm:     item?.concluidoEm,
      };
    });

    return Result.ok({
      rotinaId:            rotina.id.toString(),
      registroDiarioId:    reg.id.toString(),
      nomeRotina:          rotina.nome,
      data:                hoje,
      passos:              passosMapeados,
      percentualConcluido: reg.percentualConcluido ?? 0,
      estrelasGanhas:      reg.estrelasGanhas?.quantidade ?? 0,
      fotosUrl:            reg.fotosUrl,
    });
  }
}
