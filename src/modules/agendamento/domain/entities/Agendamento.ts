import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'NAO_COMPARECEU';

interface AgendamentoProps {
  clinicaId:      UniqueEntityID;
  clienteId:      UniqueEntityID;
  profissionalId: UniqueEntityID;
  servicoId:      UniqueEntityID;
  inicio:         Date;
  fim:            Date;
  status:         StatusAgendamento;
  observacoes?:   string;
}

export class Agendamento extends AggregateRoot<AgendamentoProps> {
  get clinicaId()      { return this.props.clinicaId; }
  get clienteId()      { return this.props.clienteId; }
  get profissionalId() { return this.props.profissionalId; }
  get servicoId()      { return this.props.servicoId; }
  get inicio()         { return this.props.inicio; }
  get fim()            { return this.props.fim; }
  get status()         { return this.props.status; }
  get observacoes()    { return this.props.observacoes; }

  confirmar():      Result<void> { return this.transicionar('CONFIRMADO'); }
  concluir():       Result<void> { return this.transicionar('CONCLUIDO'); }
  cancelar():       Result<void> { return this.transicionar('CANCELADO'); }
  naoCompareceu():  Result<void> { return this.transicionar('NAO_COMPARECEU'); }

  private transicionar(novoStatus: StatusAgendamento): Result<void> {
    const terminais: StatusAgendamento[] = ['CANCELADO', 'CONCLUIDO', 'NAO_COMPARECEU'];
    if (terminais.includes(this.props.status)) {
      return Result.fail(`Agendamento ${this.props.status} não pode ser alterado.`);
    }
    this.props.status = novoStatus;
    return Result.ok(undefined);
  }

  // Verifica sobreposição de horário com outro agendamento
  sobrepoe(outro: { inicio: Date; fim: Date }): boolean {
    return this.props.inicio < outro.fim && this.props.fim > outro.inicio;
  }

  static criar(props: Omit<AgendamentoProps, 'status'>, id?: UniqueEntityID): Result<Agendamento> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId,      argumentName: 'clinicaId' },
      { argument: props.clienteId,      argumentName: 'clienteId' },
      { argument: props.profissionalId, argumentName: 'profissionalId' },
      { argument: props.servicoId,      argumentName: 'servicoId' },
      { argument: props.inicio,         argumentName: 'inicio' },
      { argument: props.fim,            argumentName: 'fim' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.inicio >= props.fim) return Result.fail('O início deve ser anterior ao fim.');
    if (props.inicio < new Date()) return Result.fail('Não é possível agendar no passado.');

    return Result.ok(new Agendamento({ ...props, status: 'PENDENTE' }, id));
  }

  static reconstituir(props: AgendamentoProps, id: UniqueEntityID): Agendamento {
    return new Agendamento(props, id);
  }
}
