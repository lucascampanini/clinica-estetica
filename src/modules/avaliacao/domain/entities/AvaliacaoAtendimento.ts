import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

interface AvaliacaoAtendimentoProps {
  clinicaId:   UniqueEntityID;
  clienteId:   UniqueEntityID;
  nota:        number;
  comentario?: string;
  servico?:    string;
  criadoEm:   Date;
}

export type CategoriaCliente = 'PROMOTOR' | 'NEUTRO' | 'DETRATOR';

export class AvaliacaoAtendimento extends Entity<AvaliacaoAtendimentoProps> {
  get clinicaId()   { return this.props.clinicaId; }
  get clienteId()   { return this.props.clienteId; }
  get nota()        { return this.props.nota; }
  get comentario()  { return this.props.comentario; }
  get servico()     { return this.props.servico; }
  get criadoEm()   { return this.props.criadoEm; }

  get categoria(): CategoriaCliente {
    if (this.props.nota === 5) return 'PROMOTOR';
    if (this.props.nota >= 3) return 'NEUTRO';
    return 'DETRATOR';
  }

  static criar(
    props: Omit<AvaliacaoAtendimentoProps, 'criadoEm'>,
    id?: UniqueEntityID,
  ): Result<AvaliacaoAtendimento> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId, argumentName: 'clinicaId' },
      { argument: props.clienteId, argumentName: 'clienteId' },
      { argument: props.nota,      argumentName: 'nota' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (!Number.isInteger(props.nota) || props.nota < 1 || props.nota > 5) {
      return Result.fail('Nota deve ser um inteiro entre 1 e 5.');
    }

    return Result.ok(
      new AvaliacaoAtendimento({ ...props, criadoEm: new Date() }, id),
    );
  }

  static reconstituir(
    props: AvaliacaoAtendimentoProps,
    id: UniqueEntityID,
  ): AvaliacaoAtendimento {
    return new AvaliacaoAtendimento(props, id);
  }
}
