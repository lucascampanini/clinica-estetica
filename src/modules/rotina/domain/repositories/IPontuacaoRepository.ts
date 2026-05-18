import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export interface PontuacaoCliente {
  clienteId: string;
  estrelasTotal: number;
  streakAtual: number;
  streakMaximo: number;
  ultimoDiaFeito?: Date;
}

export interface IPontuacaoRepository {
  buscarPorCliente(clienteId: UniqueEntityID): Promise<PontuacaoCliente | null>;
  salvarOuAtualizar(pontuacao: PontuacaoCliente): Promise<void>;
}
