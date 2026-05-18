import { ValueObject } from '@shared/domain/ValueObject';
import { Result } from '@shared/core/Result';

interface LinkParceiroProps {
  url: string;
  [index: string]: unknown;
}

export class LinkParceiro extends ValueObject<LinkParceiroProps> {
  get url(): string { return this.props.url; }

  private constructor(props: LinkParceiroProps) { super(props); }

  public static criar(url: string): Result<LinkParceiro> {
    const limpo = url.trim();
    if (!limpo.startsWith('http://') && !limpo.startsWith('https://')) {
      return Result.fail('Link parceiro deve ser uma URL válida (http:// ou https://).');
    }
    if (limpo.length > 2048) {
      return Result.fail('Link parceiro muito longo (máximo 2048 caracteres).');
    }
    return Result.ok(new LinkParceiro({ url: limpo }));
  }
}
