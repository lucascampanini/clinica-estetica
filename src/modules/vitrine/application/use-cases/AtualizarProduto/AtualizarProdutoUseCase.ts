import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { LinkParceiro } from '@modules/vitrine/domain/value-objects/LinkParceiro';
import { IProdutoVitrineRepository } from '@modules/vitrine/domain/repositories/IProdutoVitrineRepository';

export interface AtualizarProdutoDTO {
  produtoId: string;
  nome?: string;
  descricao?: string;
  imagemUrl?: string;
  preco?: number;
  categoria?: string;
  linkParceiro?: string;
  ordem?: number;
  destaque?: boolean;
  ativo?: boolean;
}

export class AtualizarProdutoUseCase {
  constructor(private readonly repo: IProdutoVitrineRepository) {}

  public async executar(dto: AtualizarProdutoDTO): Promise<Result<void>> {
    const produto = await this.repo.buscarPorId(new UniqueEntityID(dto.produtoId));
    if (!produto) return Result.fail('Produto não encontrado.');

    let novoLink: LinkParceiro | undefined;
    if (dto.linkParceiro) {
      const linkOrError = LinkParceiro.criar(dto.linkParceiro);
      if (linkOrError.isFailure) return Result.fail(linkOrError.getErrorValue());
      novoLink = linkOrError.getValue();
    }

    if (dto.ativo === false) {
      produto.desativar();
    }

    produto.atualizar({
      nome:         dto.nome,
      descricao:    dto.descricao,
      imagemUrl:    dto.imagemUrl,
      preco:        dto.preco,
      categoria:    dto.categoria,
      linkParceiro: novoLink,
      ordem:        dto.ordem,
      destaque:     dto.destaque,
    });

    await this.repo.atualizar(produto);
    return Result.ok();
  }
}
