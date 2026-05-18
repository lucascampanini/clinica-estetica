import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { IProdutoVitrineRepository } from '@modules/vitrine/domain/repositories/IProdutoVitrineRepository';

interface RegistrarCliqueDTO {
  produtoId: string;
  clienteId?: string;
}

interface RegistrarCliqueResponse {
  urlRedirect: string;
}

export class RegistrarCliqueUseCase {
  constructor(private readonly repo: IProdutoVitrineRepository) {}

  public async executar(dto: RegistrarCliqueDTO): Promise<Result<RegistrarCliqueResponse>> {
    const produtoId = new UniqueEntityID(dto.produtoId);
    const produto = await this.repo.buscarPorId(produtoId);

    if (!produto) return Result.fail('Produto não encontrado.');
    if (!produto.ativo) return Result.fail('Produto não disponível.');

    // Registra clique de forma assíncrona — não bloqueia o redirect
    this.repo.registrarClique(produtoId, dto.clienteId).catch(() => {
      // Falha silenciosa — não impede o usuário de acessar o link
    });

    return Result.ok({ urlRedirect: produto.linkParceiro.url });
  }
}
