import { Router } from 'express';
import { AgendamentoController } from '../controllers/AgendamentoController';
import { authMiddleware } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new AgendamentoController();

// POST /agendamentos                                → cria agendamento (detecta conflito)
// PATCH /agendamentos/:id/status                   → confirmar / concluir / cancelar / nao_compareceu
// GET  /agendamentos/dia/:clinicaId?data=YYYY-MM-DD → agenda do dia
// GET  /agendamentos/cliente/:clienteId             → histórico do cliente
// GET  /agendamentos/profissional/:profissionalId?data=YYYY-MM-DD

router.post('/',                                        authMiddleware, ctrl.criar.bind(ctrl));
router.patch('/:id/status',                             authMiddleware, ctrl.atualizarStatus.bind(ctrl));
router.get('/dia/:clinicaId',                           authMiddleware, ctrl.listarPorDia.bind(ctrl));
router.get('/cliente/:clienteId',                       authMiddleware, ctrl.listarPorCliente.bind(ctrl));
router.get('/profissional/:profissionalId',             authMiddleware, ctrl.listarPorProfissional.bind(ctrl));

export { router as agendamentoRoutes };
