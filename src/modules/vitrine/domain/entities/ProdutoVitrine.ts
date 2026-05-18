import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { LinkParceiro } from '../value-objects/LinkParceiro';

interface ProdutoVitrineProps {
  clinicaId: UniqueEntityID;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  preco?: number;
  categoria?: string;
  linkParceiro: LinkParceiro;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  totalCliques: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class ProdutoVitrine extends Entity<ProdutoVitrineProps> {
  get clinicaId(): UniqueEntityID { return this.props.clinicaId; }
  get nome(): string { return this.props.nome; }
  get descricao(): string | undefined { return this.props.descricao; }
  get imagemUrl(): string | undefined { return this.props.imagemUrl; }
  get preco(): number | undefined { return this.props.preco; }
  get categoria(): string | undefined { return this.props.categoria; }
  get linkParceiro(): LinkParceiro { return this.props.linkParceiro; }
  get ativo(): boolean { return this.props.ativo; }
  get destaque(): boolean { return this.props.destaque; }
  get ordem(): number { return this.props.ordem; }
  get totalCliques(): number { return this.props.totalCliques; }

  private constructor(props: ProdutoVitrineProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public registrarClique(): void {
    this.props.totalCliques += 1;
    this.props.atualizadoEm = new Date();
  }

  public desativar(): void {
    this.props.ativo = false;
    this.props.atualizadoEm = new Date();
  }

  public marcarComoDestaque(destaque: boolean): void {
    this.props.destaque = destaque;
    this.props.atualizadoEm = new Date();
  }

  public atualizar(campos: {
    nome?: string;
    descricao?: string;
    imagemUrl?: string;
    preco?: number;
    categoria?: string;
    linkParceiro?: LinkParceiro;
    ordem?: number;
    destaque?: boolean;
  }): void {
    if (campos.nome) this.props.nome = campos.nome;
    if (campos.descricao !== undefined) this.props.descricao = campos.descricao;
    if (campos.imagemUrl !== undefined) this.props.imagemUrl = campos.imagemUrl;
    if (campos.preco !== undefined) this.props.preco = campos.preco;
    if (campos.categoria !== undefined) this.props.categoria = campos.categoria;
    if (campos.linkParceiro) this.props.linkParceiro = campos.linkParceiro;
    if (campos.ordem !== undefined) this.props.ordem = campos.ordem;
    if (campos.destaque !== undefined) this.props.destaque = campos.destaque;
    this.props.atualizadoEm = new Date();
  }

  public static criar(
    props: Omit<ProdutoVitrineProps, 'ativo' | 'destaque' | 'totalCliques' | 'criadoEm' | 'atualizadoEm'>,
    id?: UniqueEntityID,
  ): Result<ProdutoVitrine> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId, argumentName: 'clinicaId' },
      { argument: props.nome, argumentName: 'nome' },
      { argument: props.linkParceiro, argumentName: 'linkParceiro' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.nome.trim().length < 2) {
      return Result.fail('Nome do produto deve ter pelo menos 2 caracteres.');
    }
    if (props.preco !== undefined && props.preco < 0) {
      return Result.fail('Preço não pode ser negativo.');
    }

    return Result.ok(new ProdutoVitrine(
      { ...props, ativo: true, destaque: false, totalCliques: 0, criadoEm: new Date(), atualizadoEm: new Date() },
      id,
    ));
  }
}
