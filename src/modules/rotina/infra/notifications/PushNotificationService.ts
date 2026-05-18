import { PrismaClient } from '@prisma/client';

// Interface para o payload da notificação
interface NotificacaoPush {
  titulo: string;
  corpo: string;
  dados?: Record<string, string>;
}

/**
 * Serviço de notificações push via Firebase Cloud Messaging (FCM).
 *
 * Para ativar: instalar firebase-admin e configurar FIREBASE_SERVICE_ACCOUNT_KEY no .env
 * Por enquanto a implementação faz log para facilitar o desenvolvimento.
 */
export class PushNotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  async enviarParaCliente(clienteId: string, notificacao: NotificacaoPush): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany({
      where: { clienteId, ativo: true },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    for (const { token } of tokens) {
      await this.enviarPush(token, notificacao);
    }
  }

  async enviarLembretesRotina(clinicaId: string): Promise<void> {
    // Busca todos os passos com horário sugerido para enviar lembretes na hora certa
    // Este método é chamado a cada minuto via cron job
    const agora = new Date();
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const diaSemana = agora.getDay();

    const passos = await this.prisma.passoRotina.findMany({
      where: {
        horarioSugerido: horaAtual,
        ativo: true,
        rotina: {
          ativa: true,
          clinicaId,
        },
      },
      include: {
        rotina: {
          select: { clienteId: true, nome: true },
        },
      },
    });

    for (const passo of passos) {
      // Verifica se o passo deve ser executado hoje
      const diasSemana = passo.diasSemana as number[];
      const deveExecutarHoje = diasSemana.length === 0 || diasSemana.includes(diaSemana);
      if (!deveExecutarHoje) continue;

      await this.enviarParaCliente(passo.rotina.clienteId, {
        titulo: `Lembrete: ${passo.nome}`,
        corpo: passo.produto
          ? `Use ${passo.produto}. Parte da sua rotina "${passo.rotina.nome}".`
          : `Hora de realizar: ${passo.nome}. Parte da sua rotina "${passo.rotina.nome}".`,
        dados: {
          tipo: 'LEMBRETE_PASSO',
          passoRotinaId: passo.id,
        },
      });
    }
  }

  private async enviarPush(token: string, notificacao: NotificacaoPush): Promise<void> {
    // TODO: substituir pelo firebase-admin quando configurado
    // Exemplo de implementação com firebase-admin:
    //
    // await admin.messaging().send({
    //   token,
    //   notification: { title: notificacao.titulo, body: notificacao.corpo },
    //   data: notificacao.dados,
    //   webpush: {
    //     notification: { icon: '/icon-192.png', badge: '/badge.png' },
    //   },
    // });

    console.log(`[PUSH] token=${token.slice(0, 20)}... titulo="${notificacao.titulo}"`);
  }
}
