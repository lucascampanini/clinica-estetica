import { Router } from 'express';
import { ProfissionalController } from '../controllers/ProfissionalController';
import { authMiddleware, requirePerfil } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new ProfissionalController();

// GET  /profissionais/:clinicaId            → lista profissionais (?todos=true)
// POST /profissionais                       → cria profissional
// PUT  /profissionais/:id                   → atualiza dados
// PUT  /profissionais/:id/disponibilidade   → substitui agenda semanal

router.get('/:clinicaId',               ctrl.listar.bind(ctrl));
router.post('/',          authMiddleware, requirePerfil('ADMIN'), ctrl.criar.bind(ctrl));
router.put('/:id',        authMiddleware, requirePerfil('ADMIN'), ctrl.atualizar.bind(ctrl));
router.put('/:id/disponibilidade', authMiddleware, requirePerfil('ADMIN', 'PROFISSIONAL'), ctrl.setDisponibilidade.bind(ctrl));

export { router as profissionalRoutes };
