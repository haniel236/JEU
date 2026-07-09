import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';
import pushRoutes from './push.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zmj-backend', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/push', pushRoutes);

export default router;
