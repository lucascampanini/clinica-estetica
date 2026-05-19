import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Agendamento } from '../entities/Agendamento';

export interface IAgendamentoRepository {
  salvar(agendamento: Agendamento): Promise<void>;
  atualizar(agendamento: Agendamento): Promise<void>;
  buscarPorId(id: UniqueEntityID): Promise<Agendamento | null>;
  listarPorDia(clinicaId: UniqueEntityID, data: Date): Promise<Agendamento[]>;
  listarPorCliente(clienteId: UniqueEntityID): Promise<Agendamento[]>;
  listarPorProfissional(profissionalId: UniqueEntityID, data: Date): Promise<Agendamento[]>;
  // Retorna conflitos de horário para um profissional (excluindo o próprio agendamento se id fornecido)
  buscarConflitos(
    profissionalId: UniqueEntityID,
    inicio: Date,
    fim: Date,
    excluirId?: UniqueEntityID,
  ): Promise<Agendamento[]>;
}
