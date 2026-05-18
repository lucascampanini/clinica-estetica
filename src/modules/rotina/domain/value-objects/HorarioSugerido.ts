import { ValueObject } from '@shared/domain/ValueObject';
import { Result } from '@shared/core/Result';

interface HorarioSugeridoProps {
  valor: string; // "HH:MM"
  [index: string]: unknown;
}

export class HorarioSugerido extends ValueObject<HorarioSugeridoProps> {
  get valor(): string {
    return this.props.valor;
  }

  private constructor(props: HorarioSugeridoProps) {
    super(props);
  }

  public static criar(horario: string): Result<HorarioSugerido> {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(horario)) {
      return Result.fail('Horário inválido. Use o formato HH:MM (ex: 08:00).');
    }
    return Result.ok(new HorarioSugerido({ valor: horario }));
  }
}
