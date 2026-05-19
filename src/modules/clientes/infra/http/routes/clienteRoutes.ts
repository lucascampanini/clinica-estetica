import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';

const router = Router();
const ctrl   = new ClienteController();

// GET /clientes/aniversariantes-hoje/:clinicaId → esteticista vê quem faz aniversário hoje

router.get('/aniversariantes-hoje/:clinicaId', ctrl.aniversariantesHoje.bind(ctrl));

export { router as clienteRoutes };
