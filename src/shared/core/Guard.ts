interface GuardArgument {
  argument: unknown;
  argumentName: string;
}

interface GuardResult {
  succeeded: boolean;
  message?: string;
}

export class Guard {
  public static againstNullOrUndefinedBulk(args: GuardArgument[]): GuardResult {
    for (const arg of args) {
      const result = Guard.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) return result;
    }
    return { succeeded: true };
  }

  public static againstNullOrUndefined(argument: unknown, argumentName: string): GuardResult {
    if (argument === null || argument === undefined) {
      return { succeeded: false, message: `${argumentName} é obrigatório.` };
    }
    return { succeeded: true };
  }

  public static isValidEnum<T extends object>(value: unknown, enumType: T): GuardResult {
    if (!Object.values(enumType).includes(value as T[keyof T])) {
      return { succeeded: false, message: `Valor inválido: ${value}.` };
    }
    return { succeeded: true };
  }

  public static inRange(value: number, min: number, max: number, argumentName: string): GuardResult {
    if (value < min || value > max) {
      return { succeeded: false, message: `${argumentName} deve estar entre ${min} e ${max}.` };
    }
    return { succeeded: true };
  }
}
