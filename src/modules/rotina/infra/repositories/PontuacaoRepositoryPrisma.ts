import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IPontuacaoRepository, PontuacaoCliente } from '../../domain/repositories/IPontuacaoRepository';

export class PontuacaoRepositoryPrisma implements IPontuacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorCliente(clienteId: UniqueEntityID): Promise<PontuacaoCliente | null> {
    const raw = await this.prisma.pontuacaoCliente.findUnique({
      where: { clienteId: clienteId.toString() },
    });
    if (!raw) return null;
    return {
      clienteId:     raw.clienteId,
      estrelasTotal: raw.estrelasTotal,
      streakAtual:   raw.streakAtual,
      streakMaximo:  raw.streakMaximo,
      ultimoDiaFeito: raw.ultimoDiaFeito ?? undefined,
    };
  }

  async salvarOuAtualizar(pontuacao: PontuacaoCliente): Promise<void> {
    await this.prisma.pontuacaoCliente.upsert({
      where: { clienteId: pontuacao.clienteId },
      create: {
        clienteId:     pontuacao.clienteId,
        clinicaId:     '', // será preenchido via query antes se necessário
        estrelasTotal: pontuacao.estrelasTotal,
        streakAtual:   pontuacao.streakAtual,
        streakMaximo:  pontuacao.streakMaximo,
        ultimoDiaFeito: pontuacao.ultimoDiaFeito,
      },
      update: {
        estrelasTotal: pontuacao.estrelasTotal,
        streakAtual:   pontuacao.streakAtual,
        streakMaximo:  pontuacao.streakMaximo,
        ultimoDiaFeito: pontuacao.ultimoDiaFeito,
      },
    });
  }
}
