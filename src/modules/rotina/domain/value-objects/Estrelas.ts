import { ValueObject } from '@shared/domain/ValueObject';
import { Result } from '@shared/core/Result';

interface EstrelaProps {
  quantidade: number; // 0-5
  [index: string]: unknown;
}

export class Estrelas extends ValueObject<EstrelaProps> {
  get quantidade(): number {
    return this.props.quantidade;
  }

  private constructor(props: EstrelaProps) {
    super(props);
  }

  // 0-19%: 0 estrelas, 20-39%: 1, 40-59%: 2, 60-79%: 3, 80-99%: 4, 100%: 5
  public static calcularPorPercentual(percentual: number): Result<Estrelas> {
    if (percentual < 0 || percentual > 100) {
      return Result.fail('Percentual deve estar entre 0 e 100.');
    }
    let qtd: number;
    if (percentual === 100) qtd = 5;
    else if (percentual >= 80) qtd = 4;
    else if (percentual >= 60) qtd = 3;
    else if (percentual >= 40) qtd = 2;
    else if (percentual >= 20) qtd = 1;
    else qtd = 0;

    return Result.ok(new Estrelas({ quantidade: qtd }));
  }

  public static criar(quantidade: number): Result<Estrelas> {
    if (quantidade < 0 || quantidade > 5) {
      return Result.fail('Estrelas devem estar entre 0 e 5.');
    }
    return Result.ok(new Estrelas({ quantidade }));
  }
}
