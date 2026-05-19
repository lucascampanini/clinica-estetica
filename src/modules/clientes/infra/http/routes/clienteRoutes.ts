import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';

const router = Router();
const ctrl   = new ClienteController();

// GET /clientes/:clinicaId                      → lista clientes (?busca=texto)
// GET /clientes/aniversariantes-hoje/:clinicaId → esteticista vê quem faz aniversário hoje

router.get('/aniversariantes-hoje/:clinicaId', ctrl.aniversariantesHoje.bind(ctrl));
router.get('/:clinicaId',                      ctrl.listar.bind(ctrl));

export { router as clienteRoutes };
