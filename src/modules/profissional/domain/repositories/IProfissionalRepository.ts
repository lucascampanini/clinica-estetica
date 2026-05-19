import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Profissional } from '../entities/Profissional';

export interface IProfissionalRepository {
  salvar(profissional: Profissional): Promise<void>;
  atualizar(profissional: Profissional): Promise<void>;
  buscarPorId(id: UniqueEntityID): Promise<Profissional | null>;
  listar(clinicaId: UniqueEntityID, apenasAtivos?: boolean): Promise<Profissional[]>;
}
