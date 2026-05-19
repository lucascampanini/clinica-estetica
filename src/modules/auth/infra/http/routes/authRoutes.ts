import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, requirePerfil } from '@shared/infra/http/middleware/authMiddleware';

const router = Router();
const ctrl   = new AuthController();

// POST /auth/login                → autentica e retorna JWT
// POST /auth/usuarios             → cria usuário (apenas ADMIN autenticado)

router.post('/login',    ctrl.login.bind(ctrl));
router.post('/usuarios', authMiddleware, requirePerfil('ADMIN'), ctrl.criarUsuario.bind(ctrl));

export { router as authRoutes };
