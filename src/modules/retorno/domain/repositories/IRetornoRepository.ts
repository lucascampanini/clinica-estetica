import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { RetornoRecomendado, StatusRetorno } from '../entities/RetornoRecomendado';

export interface IRetornoRepository {
  salvar(retorno: RetornoRecomendado): Promise<void>;
  atualizar(retorno: RetornoRecomendado): Promise<void>;
  buscarPorId(id: UniqueEntityID): Promise<RetornoRecomendado | null>;
  listarPendentes(clinicaId: UniqueEntityID): Promise<RetornoRecomendado[]>;
  // Retornos cujo dataRetorno é em N dias e lembrete ainda não foi enviado
  buscarParaLembrete(diasRestantes: 1 | 7): Promise<RetornoRecomendado[]>;
}
