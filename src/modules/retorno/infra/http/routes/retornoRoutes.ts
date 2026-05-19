import { Router } from 'express';
import { RetornoController } from '../controllers/RetornoController';

const router = Router();
const ctrl   = new RetornoController();

// POST  /retornos                          → esteticista agenda retorno
// GET   /retornos/pendentes/:clinicaId     → painel de retornos pendentes
// PATCH /retornos/:id/status               → atualiza status (AGENDADO, CANCELADO…)

router.post('/',                         ctrl.agendar.bind(ctrl));
router.get('/pendentes/:clinicaId',      ctrl.pendentes.bind(ctrl));
router.patch('/:id/status',             ctrl.atualizarStatus.bind(ctrl));

export { router as retornoRoutes };
