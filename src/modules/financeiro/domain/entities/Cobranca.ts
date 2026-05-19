import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'TRANSFERENCIA';
export type StatusCobranca = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO';

interface CobrancaProps {
  clinicaId:      UniqueEntityID;
  agendamentoId:  UniqueEntityID;
  valor:          number;
  formaPagamento: FormaPagamento;
  status:         StatusCobranca;
  pagoEm?:        Date;
}

export class Cobranca extends Entity<CobrancaProps> {
  get clinicaId()      { return this.props.clinicaId; }
  get agendamentoId()  { return this.props.agendamentoId; }
  get valor()          { return this.props.valor; }
  get formaPagamento() { return this.props.formaPagamento; }
  get status()         { return this.props.status; }
  get pagoEm()         { return this.props.pagoEm; }

  registrarPagamento(forma: FormaPagamento): Result<void> {
    if (this.props.status !== 'PENDENTE') {
      return Result.fail(`Cobrança com status ${this.props.status} não pode ser paga.`);
    }
    this.props.formaPagamento = forma;
    this.props.status         = 'PAGO';
    this.props.pagoEm         = new Date();
    return Result.ok(undefined);
  }

  cancelar(): Result<void> {
    if (this.props.status !== 'PENDENTE') {
      return Result.fail(`Apenas cobranças PENDENTE podem ser canceladas.`);
    }
    this.props.status = 'CANCELADO';
    return Result.ok(undefined);
  }

  static criar(
    props: Omit<CobrancaProps, 'status' | 'pagoEm'>,
    id?: UniqueEntityID,
  ): Result<Cobranca> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId,     argumentName: 'clinicaId' },
      { argument: props.agendamentoId, argumentName: 'agendamentoId' },
      { argument: props.valor,         argumentName: 'valor' },
      { argument: props.formaPagamento, argumentName: 'formaPagamento' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);
    if (props.valor <= 0) return Result.fail('Valor deve ser maior que zero.');

    return Result.ok(new Cobranca({ ...props, status: 'PENDENTE' }, id));
  }

  static reconstituir(props: CobrancaProps, id: UniqueEntityID): Cobranca {
    return new Cobranca(props, id);
  }
}
