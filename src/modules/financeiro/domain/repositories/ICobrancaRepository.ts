import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Cobranca } from '../entities/Cobranca';

export interface RelatorioFinanceiro {
  totalReceita:   number;
  totalPendente:  number;
  quantidadePago: number;
  porFormaPagamento: Record<string, number>;
}

export interface ICobrancaRepository {
  salvar(cobranca: Cobranca): Promise<void>;
  atualizar(cobranca: Cobranca): Promise<void>;
  buscarPorId(id: UniqueEntityID): Promise<Cobranca | null>;
  buscarPorAgendamento(agendamentoId: UniqueEntityID): Promise<Cobranca | null>;
  relatorio(clinicaId: UniqueEntityID, de: Date, ate: Date): Promise<RelatorioFinanceiro>;
  listar(clinicaId: UniqueEntityID, de: Date, ate: Date): Promise<Cobranca[]>;
}
