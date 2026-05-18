import { UniqueEntityID } from '../UniqueEntityID';
import { IDomainEvent } from './IDomainEvent';

export type AggregateWithEvents = {
  id: UniqueEntityID;
  domainEvents: IDomainEvent[];
  clearEvents(): void;
};

type EventHandler = (event: IDomainEvent) => void;

export class DomainEvents {
  private static handlersMap: Map<string, EventHandler[]> = new Map();
  private static markedAggregates: AggregateWithEvents[] = [];

  public static markAggregateForDispatch(aggregate: AggregateWithEvents): void {
    const found = DomainEvents.markedAggregates.find(a => a.id.equals(aggregate.id));
    if (!found) {
      DomainEvents.markedAggregates.push(aggregate);
    }
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = DomainEvents.markedAggregates.find(a => a.id.equals(id));
    if (aggregate) {
      aggregate.domainEvents.forEach(event => DomainEvents.dispatch(event));
      aggregate.clearEvents();
      DomainEvents.markedAggregates = DomainEvents.markedAggregates.filter(
        a => !a.id.equals(id),
      );
    }
  }

  public static register(handler: EventHandler, eventClassName: string): void {
    if (!DomainEvents.handlersMap.has(eventClassName)) {
      DomainEvents.handlersMap.set(eventClassName, []);
    }
    DomainEvents.handlersMap.get(eventClassName)!.push(handler);
  }

  public static clearHandlers(): void {
    DomainEvents.handlersMap = new Map();
  }

  public static clearMarkedAggregates(): void {
    DomainEvents.markedAggregates = [];
  }

  private static dispatch(event: IDomainEvent): void {
    const eventClassName = event.constructor.name;
    const handlers = DomainEvents.handlersMap.get(eventClassName) ?? [];
    handlers.forEach(handler => handler(event));
  }
}
