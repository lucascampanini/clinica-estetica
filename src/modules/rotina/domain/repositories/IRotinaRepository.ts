import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Rotina } from '../entities/Rotina';

export interface IRotinaRepository {
  buscarPorId(id: UniqueEntityID): Promise<Rotina | null>;
  buscarAtivasPorCliente(clienteId: UniqueEntityID): Promise<Rotina[]>;
  buscarPorClinica(clinicaId: UniqueEntityID): Promise<Rotina[]>;
  salvar(rotina: Rotina): Promise<void>;
  atualizar(rotina: Rotina): Promise<void>;
}
