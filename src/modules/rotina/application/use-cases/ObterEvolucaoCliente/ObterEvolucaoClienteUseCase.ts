import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { IRegistroDiarioRepository } from '@modules/rotina/domain/repositories/IRegistroDiarioRepository';
import { IPontuacaoRepository } from '@modules/rotina/domain/repositories/IPontuacaoRepository';
import { RegistroDiario } from '@modules/rotina/domain/entities/RegistroDiario';

interface ObterEvolucaoDTO {
  clienteId: string;
  limite?: number;
}

export interface DiaEvolucaoDTO {
  data: Date;
  percentualConcluido: number;
  estrelasGanhas: number;
  fotosUrl: string[];
}

export interface EvolucaoClienteDTO {
  estrelasTotal: number;
  streakAtual: number;
  streakMaximo: number;
  historico: DiaEvolucaoDTO[];
}

export class ObterEvolucaoClienteUseCase {
  constructor(
    private readonly registroRepo: IRegistroDiarioRepository,
    private readonly pontuacaoRepo: IPontuacaoRepository,
  ) {}

  public async executar(dto: ObterEvolucaoDTO): Promise<Result<EvolucaoClienteDTO>> {
    const clienteId = new UniqueEntityID(dto.clienteId);
    const limite = dto.limite ?? 30;

    const [registros, pontuacao] = await Promise.all([
      this.registroRepo.buscarHistorico(clienteId, limite),
      this.pontuacaoRepo.buscarPorCliente(clienteId),
    ]);

    const historico: DiaEvolucaoDTO[] = registros.map((r: RegistroDiario) => ({
      data:                r.data,
      percentualConcluido: r.percentualConcluido ?? 0,
      estrelasGanhas:      r.estrelasGanhas?.quantidade ?? 0,
      fotosUrl:            r.fotosUrl,
    }));

    return Result.ok({
      estrelasTotal: pontuacao?.estrelasTotal ?? 0,
      streakAtual:   pontuacao?.streakAtual ?? 0,
      streakMaximo:  pontuacao?.streakMaximo ?? 0,
      historico,
    });
  }
}
