import { IDomainEvent } from '@shared/domain/events/IDomainEvent';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export class PassoConcluido implements IDomainEvent {
  readonly ocorridoEm: Date;
  readonly registroDiarioId: UniqueEntityID;
  readonly passoRotinaId: UniqueEntityID;
  readonly clienteId: UniqueEntityID;

  constructor(
    registroDiarioId: UniqueEntityID,
    passoRotinaId: UniqueEntityID,
    clienteId: UniqueEntityID,
  ) {
    this.ocorridoEm = new Date();
    this.registroDiarioId = registroDiarioId;
    this.passoRotinaId = passoRotinaId;
    this.clienteId = clienteId;
  }

  getAggregateId(): UniqueEntityID {
    return this.registroDiarioId;
  }
}
