import { Router } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';
import { authMiddleware, requirePerfil } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new FinanceiroController();

// POST /financeiro/cobrancas                         → cria cobrança para agendamento
// PATCH /financeiro/cobrancas/:id/pagar              → registra pagamento
// GET  /financeiro/relatorio/:clinicaId?de=&ate=     → relatório de receita
// GET  /financeiro/cobrancas/:clinicaId?de=&ate=     → lista cobranças do período

router.post('/cobrancas',                   authMiddleware, requirePerfil('ADMIN', 'RECEPCIONISTA'), ctrl.criarCobranca.bind(ctrl));
router.patch('/cobrancas/:id/pagar',        authMiddleware, requirePerfil('ADMIN', 'RECEPCIONISTA'), ctrl.registrarPagamento.bind(ctrl));
router.get('/relatorio/:clinicaId',         authMiddleware, requirePerfil('ADMIN'),                  ctrl.relatorio.bind(ctrl));
router.get('/cobrancas/:clinicaId',         authMiddleware, requirePerfil('ADMIN', 'RECEPCIONISTA'), ctrl.listar.bind(ctrl));

export { router as financeiroRoutes };
