import { IDomainEvent } from '@shared/domain/events/IDomainEvent';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export class RotinaCriada implements IDomainEvent {
  readonly ocorridoEm: Date;
  readonly rotinaId: UniqueEntityID;
  readonly clienteId: UniqueEntityID;
  readonly profissionalId: UniqueEntityID;

  constructor(rotinaId: UniqueEntityID, clienteId: UniqueEntityID, profissionalId: UniqueEntityID) {
    this.ocorridoEm = new Date();
    this.rotinaId = rotinaId;
    this.clienteId = clienteId;
    this.profissionalId = profissionalId;
  }

  getAggregateId(): UniqueEntityID {
    return this.rotinaId;
  }
}
