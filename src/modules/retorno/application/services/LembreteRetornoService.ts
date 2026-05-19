import { RetornoRepositoryPrisma } from '../../infra/repositories/RetornoRepositoryPrisma';
import { RetornoRecomendado } from '../../domain/entities/RetornoRecomendado';

// Chamado via cron job (ex: uma vez por dia às 08:00)
export class LembreteRetornoService {
  constructor(private readonly repo: RetornoRepositoryPrisma) {}

  async executar(): Promise<void> {
    await Promise.all([
      this.processarLembretes(7),
      this.processarLembretes(1),
    ]);
  }

  private async processarLembretes(dias: 1 | 7): Promise<void> {
    const retornos = await this.repo.buscarParaLembrete(dias);

    for (const retorno of retornos) {
      await this.enviarNotificacao(retorno, dias);

      if (dias === 7) retorno.marcarLembrete7dias();
      else            retorno.marcarLembrete1dia();

      await this.repo.atualizar(retorno);
    }
  }

  // Stub — substituir por firebase-admin ou WhatsApp API
  private async enviarNotificacao(retorno: RetornoRecomendado, diasRestantes: number): Promise<void> {
    console.log(
      `[LembreteRetorno] clienteId=${retorno.clienteId} dataRetorno=${retorno.dataRetorno.toISOString()} dias=${diasRestantes}`,
    );
    // TODO: chamar PushNotificationService ou WhatsApp API aqui
  }
}
