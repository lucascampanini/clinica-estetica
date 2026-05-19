import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export interface DisponibilidadeSlot {
  diaSemana:  number; // 0=dom … 6=sab
  horaInicio: string; // "09:00"
  horaFim:    string; // "18:00"
}

interface ProfissionalProps {
  clinicaId:        UniqueEntityID;
  nome:             string;
  especialidade?:   string;
  telefone?:        string;
  ativo:            boolean;
  disponibilidades: DisponibilidadeSlot[];
}

export class Profissional extends Entity<ProfissionalProps> {
  get clinicaId()        { return this.props.clinicaId; }
  get nome()             { return this.props.nome; }
  get especialidade()    { return this.props.especialidade; }
  get telefone()         { return this.props.telefone; }
  get ativo()            { return this.props.ativo; }
  get disponibilidades() { return this.props.disponibilidades; }

  atualizar(campos: Partial<Pick<ProfissionalProps, 'nome' | 'especialidade' | 'telefone'>>): void {
    if (campos.nome !== undefined)          this.props.nome          = campos.nome;
    if (campos.especialidade !== undefined) this.props.especialidade = campos.especialidade;
    if (campos.telefone !== undefined)      this.props.telefone      = campos.telefone;
  }

  setDisponibilidades(slots: DisponibilidadeSlot[]): void {
    this.props.disponibilidades = slots;
  }

  desativar(): void { this.props.ativo = false; }

  estaDisponivel(diaSemana: number, horaInicio: string, horaFim: string): boolean {
    return this.props.disponibilidades.some(d => {
      if (d.diaSemana !== diaSemana) return false;
      return d.horaInicio <= horaInicio && d.horaFim >= horaFim;
    });
  }

  static criar(
    props: Omit<ProfissionalProps, 'ativo' | 'disponibilidades'>,
    id?: UniqueEntityID,
  ): Result<Profissional> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId, argumentName: 'clinicaId' },
      { argument: props.nome,      argumentName: 'nome' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    return Result.ok(new Profissional({ ...props, ativo: true, disponibilidades: [] }, id));
  }

  static reconstituir(props: ProfissionalProps, id: UniqueEntityID): Profissional {
    return new Profissional(props, id);
  }
}
