import { Router } from 'express';
import { VitrineController } from '../controllers/VitrineController';

const router = Router();
const ctrl = new VitrineController();

// ── Esteticista (app master) ────────────────────────────────
// POST  /vitrine                      → cadastra produto
// PUT   /vitrine/:id                  → atualiza produto (nome, link, destaque, etc.)
// GET   /vitrine/master/:clinicaId    → lista todos + total de cliques por produto

// ── Cliente (app da cliente) ────────────────────────────────
// GET   /vitrine/:clinicaId           → lista produtos ativos (visual da vitrine)
// GET   /vitrine/:id/ir               → registra clique + redirect 302 para o link parceiro

router.post('/', ctrl.cadastrar.bind(ctrl));
router.put('/:id', ctrl.atualizar.bind(ctrl));
router.get('/master/:clinicaId', ctrl.listarMaster.bind(ctrl));
router.get('/:clinicaId', ctrl.listarVitrine.bind(ctrl));
router.get('/:id/ir', ctrl.redirecionar.bind(ctrl));

export { router as vitrineRoutes };
