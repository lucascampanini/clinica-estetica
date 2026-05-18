import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PeriodoRotina } from '../enums/PeriodoRotina';
import { HorarioSugerido } from '../value-objects/HorarioSugerido';

interface PassoRotinaProps {
  rotinaId: UniqueEntityID;
  nome: string;
  produto?: string;
  instrucoes?: string;
  periodo: PeriodoRotina;
  horarioSugerido?: HorarioSugerido;
  diasSemana: number[];  // vazio = todos os dias
  ordem: number;
  ativo: boolean;
  criadoEm: Date;
}

export class PassoRotina extends Entity<PassoRotinaProps> {
  get rotinaId(): UniqueEntityID { return this.props.rotinaId; }
  get nome(): string { return this.props.nome; }
  get produto(): string | undefined { return this.props.produto; }
  get instrucoes(): string | undefined { return this.props.instrucoes; }
  get periodo(): PeriodoRotina { return this.props.periodo; }
  get horarioSugerido(): HorarioSugerido | undefined { return this.props.horarioSugerido; }
  get diasSemana(): number[] { return this.props.diasSemana; }
  get ordem(): number { return this.props.ordem; }
  get ativo(): boolean { return this.props.ativo; }

  private constructor(props: PassoRotinaProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public deveExecutarHoje(diaSemana: number): boolean {
    if (this.props.diasSemana.length === 0) return true;
    return this.props.diasSemana.includes(diaSemana);
  }

  public desativar(): void {
    this.props.ativo = false;
  }

  public static criar(
    props: Omit<PassoRotinaProps, 'criadoEm' | 'ativo'>,
    id?: UniqueEntityID,
  ): Result<PassoRotina> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.nome, argumentName: 'nome' },
      { argument: props.periodo, argumentName: 'periodo' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.nome.trim().length < 2) {
      return Result.fail('Nome do passo deve ter pelo menos 2 caracteres.');
    }

    const diasInvalidos = props.diasSemana.filter(d => d < 0 || d > 6);
    if (diasInvalidos.length > 0) {
      return Result.fail('Dias da semana devem ser valores entre 0 (domingo) e 6 (sábado).');
    }

    return Result.ok(
      new PassoRotina({ ...props, ativo: true, criadoEm: new Date() }, id),
    );
  }
}
