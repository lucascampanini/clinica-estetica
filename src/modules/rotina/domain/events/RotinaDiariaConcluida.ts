import { IDomainEvent } from '@shared/domain/events/IDomainEvent';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export class RotinaDiariaConcluida implements IDomainEvent {
  readonly ocorridoEm: Date;
  readonly registroDiarioId: UniqueEntityID;
  readonly clienteId: UniqueEntityID;
  readonly estrelasGanhas: number;
  readonly percentualConcluido: number;

  constructor(
    registroDiarioId: UniqueEntityID,
    clienteId: UniqueEntityID,
    estrelasGanhas: number,
    percentualConcluido: number,
  ) {
    this.ocorridoEm = new Date();
    this.registroDiarioId = registroDiarioId;
    this.clienteId = clienteId;
    this.estrelasGanhas = estrelasGanhas;
    this.percentualConcluido = percentualConcluido;
  }

  getAggregateId(): UniqueEntityID {
    return this.registroDiarioId;
  }
}
