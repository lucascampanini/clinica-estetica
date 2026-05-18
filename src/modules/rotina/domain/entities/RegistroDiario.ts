import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { Estrelas } from '../value-objects/Estrelas';
import { PassoConcluido } from '../events/PassoConcluido';
import { RotinaDiariaConcluida } from '../events/RotinaDiariaConcluida';

export interface ItemChecklist {
  passoRotinaId: UniqueEntityID;
  concluido: boolean;
  concluidoEm?: Date;
}

interface RegistroDiarioProps {
  rotinaId: UniqueEntityID;
  clienteId: UniqueEntityID;
  data: Date;             // apenas a data, sem hora
  totalPassos: number;    // quantos passos havia para fazer neste dia
  checklist: ItemChecklist[];
  fotosUrl: string[];
  percentualConcluido?: number;
  estrelasGanhas?: Estrelas;
  criadoEm: Date;
}

export class RegistroDiario extends AggregateRoot<RegistroDiarioProps> {
  get rotinaId(): UniqueEntityID { return this.props.rotinaId; }
  get clienteId(): UniqueEntityID { return this.props.clienteId; }
  get data(): Date { return this.props.data; }
  get checklist(): ItemChecklist[] { return this.props.checklist; }
  get fotosUrl(): string[] { return this.props.fotosUrl; }
  get percentualConcluido(): number | undefined { return this.props.percentualConcluido; }
  get estrelasGanhas(): Estrelas | undefined { return this.props.estrelasGanhas; }
  get totalPassos(): number { return this.props.totalPassos; }

  private constructor(props: RegistroDiarioProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public concluirPasso(passoRotinaId: UniqueEntityID): Result<void> {
    const item = this.props.checklist.find(i => i.passoRotinaId.equals(passoRotinaId));
    if (!item) return Result.fail('Passo não encontrado na rotina de hoje.');
    if (item.concluido) return Result.fail('Passo já foi marcado como concluído.');

    item.concluido = true;
    item.concluidoEm = new Date();

    this.addDomainEvent(new PassoConcluido(this.id, passoRotinaId, this.props.clienteId));

    this.recalcularProgresso();
    return Result.ok();
  }

  public adicionarFoto(url: string): Result<void> {
    if (!url.startsWith('https://')) {
      return Result.fail('URL da foto inválida.');
    }
    this.props.fotosUrl.push(url);
    return Result.ok();
  }

  private recalcularProgresso(): void {
    const concluidos = this.props.checklist.filter(i => i.concluido).length;
    const percentual = this.props.totalPassos > 0
      ? Math.round((concluidos / this.props.totalPassos) * 100)
      : 0;

    this.props.percentualConcluido = percentual;

    const estrelasOrError = Estrelas.calcularPorPercentual(percentual);
    if (estrelasOrError.isSuccess) {
      const estrelas = estrelasOrError.getValue();
      this.props.estrelasGanhas = estrelas;

      if (percentual === 100) {
        this.addDomainEvent(
          new RotinaDiariaConcluida(this.id, this.props.clienteId, estrelas.quantidade, percentual),
        );
      }
    }
  }

  public static criar(
    props: Omit<RegistroDiarioProps, 'checklist' | 'fotosUrl' | 'percentualConcluido' | 'estrelasGanhas' | 'criadoEm'> & {
      passosDodia: UniqueEntityID[];
    },
    id?: UniqueEntityID,
  ): Result<RegistroDiario> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.rotinaId, argumentName: 'rotinaId' },
      { argument: props.clienteId, argumentName: 'clienteId' },
      { argument: props.data, argumentName: 'data' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    const checklist: ItemChecklist[] = props.passosDodia.map(passoId => ({
      passoRotinaId: passoId,
      concluido: false,
    }));

    return Result.ok(
      new RegistroDiario(
        {
          rotinaId: props.rotinaId,
          clienteId: props.clienteId,
          data: props.data,
          totalPassos: props.passosDodia.length,
          checklist,
          fotosUrl: [],
          percentualConcluido: 0,
          criadoEm: new Date(),
        },
        id,
      ),
    );
  }
}
