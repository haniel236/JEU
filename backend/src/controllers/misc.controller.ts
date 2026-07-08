import type { Request, Response } from 'express';
import type { Period } from '../utils/dates.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRanking } from '../services/ranking.service.js';
import { getHeadToHead } from '../services/headToHead.service.js';
import { getDashboard } from '../services/stats.service.js';
import { search } from '../services/search.service.js';
import { listAudit } from '../services/audit.service.js';
import {
  countUnread,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notification.service.js';

export const ranking = asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period as Period | 'all';
  res.json(await getRanking(req.params.groupId, period));
});

export const headToHead = asyncHandler(async (req: Request, res: Response) => {
  const result = await getHeadToHead(
    req.params.groupId,
    String(req.query.a),
    String(req.query.b),
  );
  res.json(result);
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getDashboard(req.params.groupId));
});

export const searchController = asyncHandler(async (req: Request, res: Response) => {
  res.json(await search(req.params.groupId, String(req.query.q)));
});

export const notifications = asyncHandler(async (req: Request, res: Response) => {
  const [items, unread] = await Promise.all([
    listNotifications(req.params.groupId, req.auth!.userId),
    countUnread(req.params.groupId, req.auth!.userId),
  ]);
  res.json({ items, unread });
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  await markAsRead(req.params.notificationId, req.params.groupId);
  res.json({ ok: true });
});

export const readAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  await markAllAsRead(req.params.groupId, req.auth!.userId);
  res.json({ ok: true });
});

export const auditLogs = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listAudit(req.params.groupId));
});
