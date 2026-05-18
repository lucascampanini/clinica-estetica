import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { RegistroDiario } from '../entities/RegistroDiario';

export interface IRegistroDiarioRepository {
  buscarPorRotinaEData(rotinaId: UniqueEntityID, data: Date): Promise<RegistroDiario | null>;
  buscarHistorico(clienteId: UniqueEntityID, limite: number): Promise<RegistroDiario[]>;
  salvar(registro: RegistroDiario): Promise<void>;
  atualizar(registro: RegistroDiario): Promise<void>;
}
