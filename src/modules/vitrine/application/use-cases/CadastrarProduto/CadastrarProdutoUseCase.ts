import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { ProdutoVitrine } from '@modules/vitrine/domain/entities/ProdutoVitrine';
import { LinkParceiro } from '@modules/vitrine/domain/value-objects/LinkParceiro';
import { IProdutoVitrineRepository } from '@modules/vitrine/domain/repositories/IProdutoVitrineRepository';

export interface CadastrarProdutoDTO {
  clinicaId: string;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  preco?: number;
  categoria?: string;
  linkParceiro: string;
  ordem?: number;
}

export class CadastrarProdutoUseCase {
  constructor(private readonly repo: IProdutoVitrineRepository) {}

  public async executar(dto: CadastrarProdutoDTO): Promise<Result<{ produtoId: string }>> {
    const linkOrError = LinkParceiro.criar(dto.linkParceiro);
    if (linkOrError.isFailure) return Result.fail(linkOrError.getErrorValue());

    const produtoOrError = ProdutoVitrine.criar({
      clinicaId:    new UniqueEntityID(dto.clinicaId),
      nome:         dto.nome,
      descricao:    dto.descricao,
      imagemUrl:    dto.imagemUrl,
      preco:        dto.preco,
      categoria:    dto.categoria,
      linkParceiro: linkOrError.getValue(),
      ordem:        dto.ordem ?? 0,
    });
    if (produtoOrError.isFailure) return Result.fail(produtoOrError.getErrorValue());

    const produto = produtoOrError.getValue();
    await this.repo.salvar(produto);
    return Result.ok({ produtoId: produto.id.toString() });
  }
}
