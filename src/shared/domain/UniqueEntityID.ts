import { v4 as uuidv4 } from 'uuid';

export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? uuidv4();
  }

  public equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) return false;
    return this.value === id.toValue();
  }

  public toValue(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }
}
