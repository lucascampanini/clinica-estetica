import { UniqueEntityID } from '../UniqueEntityID';

export interface IDomainEvent {
  readonly ocorridoEm: Date;
  getAggregateId(): UniqueEntityID;
}
