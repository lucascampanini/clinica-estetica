import { Router } from 'express';
import { CatalogoController } from '../controllers/CatalogoController';
import { authMiddleware, requirePerfil } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new CatalogoController();

// GET  /catalogo/:clinicaId        → lista serviços (?todos=true para incluir inativos)
// POST /catalogo                   → cria serviço (ADMIN/RECEPCIONISTA)
// PUT  /catalogo/:id               → atualiza
// DELETE /catalogo/:id             → desativa (soft-delete)

router.get('/:clinicaId',  ctrl.listar.bind(ctrl));
router.post('/',           authMiddleware, requirePerfil('ADMIN', 'RECEPCIONISTA'), ctrl.criar.bind(ctrl));
router.put('/:id',         authMiddleware, requirePerfil('ADMIN', 'RECEPCIONISTA'), ctrl.atualizar.bind(ctrl));
router.delete('/:id',      authMiddleware, requirePerfil('ADMIN'),                  ctrl.desativar.bind(ctrl));

export { router as catalogoRoutes };
