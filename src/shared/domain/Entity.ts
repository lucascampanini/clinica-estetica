import { UniqueEntityID } from './UniqueEntityID';

const isEntity = (v: unknown): v is Entity<unknown> => {
  return v instanceof Entity;
};

export abstract class Entity<TProps> {
  protected readonly _id: UniqueEntityID;
  protected props: TProps;

  protected constructor(props: TProps, id?: UniqueEntityID) {
    this._id = id ?? new UniqueEntityID();
    this.props = props;
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  public equals(object?: Entity<TProps>): boolean {
    if (object == null || object == undefined) return false;
    if (this === object) return true;
    if (!isEntity(object)) return false;
    return this._id.equals(object._id);
  }
}
