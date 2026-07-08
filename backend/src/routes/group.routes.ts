import { Router } from 'express';
import * as group from '../controllers/group.controller.js';
import * as member from '../controllers/member.controller.js';
import * as match from '../controllers/match.controller.js';
import * as misc from '../controllers/misc.controller.js';
import { requireAuth, requireMembership } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createGroupSchema,
  headToHeadQuerySchema,
  joinGroupSchema,
  matchSchema,
  paginationQuerySchema,
  periodQuerySchema,
  roleSchema,
  searchQuerySchema,
  updateGroupSchema,
} from '../validators/schemas.js';

const router = Router();

// --- Routes publiques ---
router.post('/', validate({ body: createGroupSchema }), group.create);
router.get('/lookup', group.lookup);
router.post('/join', validate({ body: joinGroupSchema }), group.join);

// --- Toutes les routes suivantes exigent une authentification ---
router.use('/:groupId', requireAuth);

// Lecture (tout membre accepté)
const member$ = requireMembership();
const admin$ = requireMembership('ADMIN');

router.get('/:groupId', member$, group.overview);
router.patch('/:groupId', admin$, validate({ body: updateGroupSchema }), group.update);

router.get('/:groupId/dashboard', member$, misc.dashboard);

// Joueurs
router.get('/:groupId/players', member$, member.list);
router.get('/:groupId/players/:membershipId', member$, member.detail);

// Classements & confrontations
router.get('/:groupId/rankings', member$, validate({ query: periodQuerySchema }), misc.ranking);
router.get(
  '/:groupId/head-to-head',
  member$,
  validate({ query: headToHeadQuerySchema }),
  misc.headToHead,
);

// Recherche
router.get('/:groupId/search', member$, validate({ query: searchQuerySchema }), misc.searchController);

// Matchs
router.get('/:groupId/matches', member$, validate({ query: paginationQuerySchema }), match.list);
router.post('/:groupId/matches', member$, validate({ body: matchSchema }), match.create);
router.put('/:groupId/matches/:matchId', admin$, validate({ body: matchSchema }), match.update);
router.delete('/:groupId/matches/:matchId', admin$, match.remove);

// Notifications
router.get('/:groupId/notifications', member$, misc.notifications);
router.post('/:groupId/notifications/read-all', member$, misc.readAllNotifications);
router.post('/:groupId/notifications/:notificationId/read', member$, misc.readNotification);

// --- Administration ---
router.get('/:groupId/admin/requests', admin$, member.pending);
router.post('/:groupId/admin/requests/:membershipId/accept', admin$, member.accept);
router.post('/:groupId/admin/requests/:membershipId/reject', admin$, member.reject);
router.patch(
  '/:groupId/admin/members/:membershipId/role',
  admin$,
  validate({ body: roleSchema }),
  member.setRole,
);
router.delete('/:groupId/admin/members/:membershipId', admin$, member.remove);
router.get('/:groupId/admin/audit', admin$, misc.auditLogs);

export default router;
