import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authMiddleware } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new ClienteController();

// POST /clientes                                → cadastra nova cliente
// GET  /clientes/:clinicaId                    → lista clientes (?busca=texto)
// GET  /clientes/aniversariantes-hoje/:clinicaId

router.post('/',                               authMiddleware, ctrl.criar.bind(ctrl));
router.get('/aniversariantes-hoje/:clinicaId', authMiddleware, ctrl.aniversariantesHoje.bind(ctrl));
router.get('/:clinicaId',                      authMiddleware, ctrl.listar.bind(ctrl));

export { router as clienteRoutes };
