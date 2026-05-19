import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Servico } from '../entities/Servico';

export interface IServicoRepository {
  salvar(servico: Servico): Promise<void>;
  atualizar(servico: Servico): Promise<void>;
  buscarPorId(id: UniqueEntityID): Promise<Servico | null>;
  listar(clinicaId: UniqueEntityID, apenasAtivos?: boolean): Promise<Servico[]>;
}
