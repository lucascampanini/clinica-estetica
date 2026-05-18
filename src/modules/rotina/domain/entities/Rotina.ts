import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PassoRotina } from './PassoRotina';
import { RotinaCriada } from '../events/RotinaCriada';

interface RotinaProps {
  clinicaId: UniqueEntityID;
  clienteId: UniqueEntityID;
  profissionalId: UniqueEntityID;
  nome: string;
  descricao?: string;
  ativa: boolean;
  passos: PassoRotina[];
  criadaEm: Date;
  atualizadaEm: Date;
}

export class Rotina extends AggregateRoot<RotinaProps> {
  get clinicaId(): UniqueEntityID { return this.props.clinicaId; }
  get clienteId(): UniqueEntityID { return this.props.clienteId; }
  get profissionalId(): UniqueEntityID { return this.props.profissionalId; }
  get nome(): string { return this.props.nome; }
  get descricao(): string | undefined { return this.props.descricao; }
  get ativa(): boolean { return this.props.ativa; }
  get passos(): PassoRotina[] { return this.props.passos; }
  get criadaEm(): Date { return this.props.criadaEm; }

  private constructor(props: RotinaProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public passosParaHoje(diaSemana: number): PassoRotina[] {
    return this.props.passos
      .filter(p => p.ativo && p.deveExecutarHoje(diaSemana))
      .sort((a, b) => a.ordem - b.ordem);
  }

  public adicionarPasso(passo: PassoRotina): Result<void> {
    const duplicado = this.props.passos.find(
      p => p.nome.toLowerCase() === passo.nome.toLowerCase() && p.ativo,
    );
    if (duplicado) {
      return Result.fail(`Já existe um passo ativo com o nome "${passo.nome}".`);
    }
    this.props.passos.push(passo);
    this.props.atualizadaEm = new Date();
    return Result.ok();
  }

  public removerPasso(passoId: UniqueEntityID): Result<void> {
    const passo = this.props.passos.find(p => p.id.equals(passoId));
    if (!passo) return Result.fail('Passo não encontrado.');
    passo.desativar();
    this.props.atualizadaEm = new Date();
    return Result.ok();
  }

  public desativar(): void {
    this.props.ativa = false;
    this.props.atualizadaEm = new Date();
  }

  public static criar(
    props: Omit<RotinaProps, 'ativa' | 'passos' | 'criadaEm' | 'atualizadaEm'>,
    id?: UniqueEntityID,
  ): Result<Rotina> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId, argumentName: 'clinicaId' },
      { argument: props.clienteId, argumentName: 'clienteId' },
      { argument: props.profissionalId, argumentName: 'profissionalId' },
      { argument: props.nome, argumentName: 'nome' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.nome.trim().length < 3) {
      return Result.fail('Nome da rotina deve ter pelo menos 3 caracteres.');
    }

    const rotina = new Rotina(
      {
        ...props,
        ativa: true,
        passos: [],
        criadaEm: new Date(),
        atualizadaEm: new Date(),
      },
      id,
    );

    rotina.addDomainEvent(
      new RotinaCriada(rotina.id, props.clienteId, props.profissionalId),
    );

    return Result.ok(rotina);
  }
}
