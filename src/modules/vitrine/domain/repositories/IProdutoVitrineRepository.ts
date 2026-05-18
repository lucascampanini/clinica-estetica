import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { ProdutoVitrine } from '../entities/ProdutoVitrine';

export interface IProdutoVitrineRepository {
  buscarPorId(id: UniqueEntityID): Promise<ProdutoVitrine | null>;
  listarAtivos(clinicaId: UniqueEntityID): Promise<ProdutoVitrine[]>;
  listarTodos(clinicaId: UniqueEntityID): Promise<ProdutoVitrine[]>;
  salvar(produto: ProdutoVitrine): Promise<void>;
  atualizar(produto: ProdutoVitrine): Promise<void>;
  registrarClique(produtoId: UniqueEntityID, clienteId?: string): Promise<void>;
}
