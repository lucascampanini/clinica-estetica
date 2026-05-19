import { Router } from 'express';
import { AvaliacaoController } from '../controllers/AvaliacaoController';

const router = Router();
const ctrl   = new AvaliacaoController();

// POST  /avaliacoes                          → cliente submete avaliação
// GET   /avaliacoes/nps/:clinicaId           → esteticista vê NPS (?dias=90)
// GET   /avaliacoes/recentes/:clinicaId      → últimas avaliações com comentários

router.post('/',                        ctrl.avaliar.bind(ctrl));
router.get('/nps/:clinicaId',           ctrl.nps.bind(ctrl));
router.get('/recentes/:clinicaId',      ctrl.recentes.bind(ctrl));

export { router as avaliacaoRoutes };
