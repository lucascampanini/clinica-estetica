import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { IProdutoVitrineRepository } from '@modules/vitrine/domain/repositories/IProdutoVitrineRepository';

interface ListarProdutosDTO {
  clinicaId: string;
  // true = visão da cliente (só ativos), false = visão da esteticista (todos)
  apenasAtivos: boolean;
}

export interface ProdutoVitrineDTO {
  id: string;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  preco?: number;
  categoria?: string;
  destaque: boolean;
  ordem: number;
  totalCliques?: number;  // só retorna para a esteticista
}

export class ListarProdutosUseCase {
  constructor(private readonly repo: IProdutoVitrineRepository) {}

  public async executar(dto: ListarProdutosDTO): Promise<Result<ProdutoVitrineDTO[]>> {
    const clinicaId = new UniqueEntityID(dto.clinicaId);
    const produtos = dto.apenasAtivos
      ? await this.repo.listarAtivos(clinicaId)
      : await this.repo.listarTodos(clinicaId);

    // Destaques primeiro, depois por ordem, depois por nome
    const ordenados = [...produtos].sort((a, b) => {
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      if (a.ordem !== b.ordem) return a.ordem - b.ordem;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    return Result.ok(ordenados.map(p => ({
      id:          p.id.toString(),
      nome:        p.nome,
      descricao:   p.descricao,
      imagemUrl:   p.imagemUrl,
      preco:       p.preco,
      categoria:   p.categoria,
      destaque:    p.destaque,
      ordem:       p.ordem,
      // Só expõe métricas para o painel master da esteticista
      ...(dto.apenasAtivos ? {} : { totalCliques: p.totalCliques }),
    })));
  }
}
