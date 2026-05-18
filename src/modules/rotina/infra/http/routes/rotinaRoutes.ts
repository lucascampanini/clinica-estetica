import { Router } from 'express';
import { RotinaController } from '../controllers/RotinaController';

const router = Router();
const ctrl = new RotinaController();

// ── Esteticista (app master) ─────────────────────────────────
// POST   /rotinas                     → cria rotina para uma cliente
// PUT    /rotinas/:id                 → atualiza rotina
// GET    /rotinas/cliente/:clienteId  → lista rotinas ativas de uma cliente
// GET    /rotinas/:id/evolucao        → evolução completa de uma cliente

// ── Cliente ─────────────────────────────────────────────────
// GET    /rotinas/hoje/:clienteId     → rotina do dia com checklist
// PATCH  /rotinas/registros/:registroId/passos/:passoId → marca passo como feito
// POST   /rotinas/push-token          → salva token de notificação push

router.post('/', ctrl.criar.bind(ctrl));
router.put('/:id', ctrl.atualizar.bind(ctrl));
router.get('/cliente/:clienteId', ctrl.listarPorCliente.bind(ctrl));
router.get('/hoje/:clienteId', ctrl.rotinaDoDia.bind(ctrl));
router.get('/:id/evolucao', ctrl.evolucao.bind(ctrl));
router.patch('/registros/:registroId/passos/:passoId', ctrl.concluirPasso.bind(ctrl));
router.post('/push-token', ctrl.registrarPushToken.bind(ctrl));

export { router as rotinaRoutes };
