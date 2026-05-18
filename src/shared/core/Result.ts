export class Result<T> {
  private readonly _isSuccess: boolean;
  private readonly _error?: string;
  private readonly _value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
  }

  get isSuccess(): boolean { return this._isSuccess; }
  get isFailure(): boolean { return !this._isSuccess; }

  public getValue(): T {
    if (!this._isSuccess) throw new Error('Não é possível obter o valor de um Result com falha.');
    return this._value as T;
  }

  public getErrorValue(): string {
    return this._error as string;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<unknown>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) return Result.fail(result.getErrorValue());
    }
    return Result.ok();
  }
}
