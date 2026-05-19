import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export type StatusRetorno = 'PENDENTE' | 'AGENDADO' | 'EXPIRADO' | 'CANCELADO';

interface RetornoRecomendadoProps {
  clinicaId:      UniqueEntityID;
  clienteId:      UniqueEntityID;
  profissionalId: UniqueEntityID;
  dataRetorno:    Date;
  observacao?:    string;
  status:         StatusRetorno;
  lembrete7dias:  boolean;
  lembrete1dia:   boolean;
  criadoEm:      Date;
}

export class RetornoRecomendado extends Entity<RetornoRecomendadoProps> {
  get clinicaId()      { return this.props.clinicaId; }
  get clienteId()      { return this.props.clienteId; }
  get profissionalId() { return this.props.profissionalId; }
  get dataRetorno()    { return this.props.dataRetorno; }
  get observacao()     { return this.props.observacao; }
  get status()         { return this.props.status; }
  get lembrete7dias()  { return this.props.lembrete7dias; }
  get lembrete1dia()   { return this.props.lembrete1dia; }
  get criadoEm()      { return this.props.criadoEm; }

  marcarLembrete7dias(): void { this.props.lembrete7dias = true; }
  marcarLembrete1dia(): void  { this.props.lembrete1dia  = true; }
  atualizarStatus(status: StatusRetorno): void { this.props.status = status; }

  static criar(
    props: Omit<RetornoRecomendadoProps, 'status' | 'lembrete7dias' | 'lembrete1dia' | 'criadoEm'>,
    id?: UniqueEntityID,
  ): Result<RetornoRecomendado> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId,      argumentName: 'clinicaId' },
      { argument: props.clienteId,      argumentName: 'clienteId' },
      { argument: props.profissionalId, argumentName: 'profissionalId' },
      { argument: props.dataRetorno,    argumentName: 'dataRetorno' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.dataRetorno <= new Date()) {
      return Result.fail('A data de retorno deve ser futura.');
    }

    return Result.ok(
      new RetornoRecomendado(
        { ...props, status: 'PENDENTE', lembrete7dias: false, lembrete1dia: false, criadoEm: new Date() },
        id,
      ),
    );
  }

  static reconstituir(props: RetornoRecomendadoProps, id: UniqueEntityID): RetornoRecomendado {
    return new RetornoRecomendado(props, id);
  }
}
