import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zmj-backend', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);

export default router;
