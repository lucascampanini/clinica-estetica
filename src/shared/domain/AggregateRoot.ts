import { Entity } from './Entity';
import { IDomainEvent } from './events/IDomainEvent';
import { DomainEvents } from './events/DomainEvents';

export abstract class AggregateRoot<TProps> extends Entity<TProps> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
