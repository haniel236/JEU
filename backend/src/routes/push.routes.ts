import { Router } from 'express';
import * as push from '../controllers/push.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/public-key', push.publicKey);
router.post('/subscribe', requireAuth, push.subscribe);
router.post('/unsubscribe', requireAuth, push.unsubscribe);

export default router;
