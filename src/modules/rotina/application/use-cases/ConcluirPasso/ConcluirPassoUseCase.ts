import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { DomainEvents } from '@shared/domain/events/DomainEvents';
import { IRegistroDiarioRepository } from '@modules/rotina/domain/repositories/IRegistroDiarioRepository';
import { IPontuacaoRepository } from '@modules/rotina/domain/repositories/IPontuacaoRepository';
import { RegistroDiario } from '@modules/rotina/domain/entities/RegistroDiario';

interface ConcluirPassoDTO {
  registroDiarioId: string;
  passoRotinaId: string;
  clienteId: string;
  fotoUrl?: string;
}

interface ConcluirPassoResponse {
  percentualConcluido: number;
  estrelasGanhas: number;
  rotinaConcluida: boolean;
}

export class ConcluirPassoUseCase {
  constructor(
    private readonly registroRepo: IRegistroDiarioRepository,
    private readonly pontuacaoRepo: IPontuacaoRepository,
  ) {}

  public async executar(dto: ConcluirPassoDTO): Promise<Result<ConcluirPassoResponse>> {
    const registroId = new UniqueEntityID(dto.registroDiarioId);
    const clienteId  = new UniqueEntityID(dto.clienteId);

    const registros = await this.registroRepo.buscarHistorico(clienteId, 7);
    const registro: RegistroDiario | undefined = registros.find(
      (r: RegistroDiario) => r.id.equals(registroId),
    );

    if (!registro) return Result.fail('Registro do dia não encontrado.');

    const concluirResult = registro.concluirPasso(new UniqueEntityID(dto.passoRotinaId));
    if (concluirResult.isFailure) return Result.fail(concluirResult.getErrorValue());

    if (dto.fotoUrl) {
      const fotoResult = registro.adicionarFoto(dto.fotoUrl);
      if (fotoResult.isFailure) return Result.fail(fotoResult.getErrorValue());
    }

    await this.registroRepo.atualizar(registro);

    const percentual = registro.percentualConcluido ?? 0;
    const estrelas   = registro.estrelasGanhas?.quantidade ?? 0;
    const rotinaConcluida = percentual === 100;

    if (rotinaConcluida) {
      await this.atualizarPontuacao(clienteId, estrelas);
    }

    DomainEvents.dispatchEventsForAggregate(registro.id);

    return Result.ok({ percentualConcluido: percentual, estrelasGanhas: estrelas, rotinaConcluida });
  }

  private async atualizarPontuacao(clienteId: UniqueEntityID, estrelasGanhas: number): Promise<void> {
    const pontuacao = await this.pontuacaoRepo.buscarPorCliente(clienteId) ?? {
      clienteId: clienteId.toString(),
      estrelasTotal: 0,
      streakAtual: 0,
      streakMaximo: 0,
    };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let novoStreak = 1;
    if (pontuacao.ultimoDiaFeito) {
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      const ultimoDia = new Date(pontuacao.ultimoDiaFeito);
      ultimoDia.setHours(0, 0, 0, 0);
      novoStreak = ultimoDia.getTime() === ontem.getTime() ? pontuacao.streakAtual + 1 : 1;
    }

    await this.pontuacaoRepo.salvarOuAtualizar({
      ...pontuacao,
      estrelasTotal:  pontuacao.estrelasTotal + estrelasGanhas,
      streakAtual:    novoStreak,
      streakMaximo:   Math.max(pontuacao.streakMaximo, novoStreak),
      ultimoDiaFeito: hoje,
    });
  }
}
