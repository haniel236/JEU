import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changeRole,
  decideRequest,
  getPlayer,
  listPendingRequests,
  listPlayers,
  removePlayer,
} from '../services/member.service.js';
import { getPlayerStats } from '../services/stats.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listPlayers(req.params.groupId));
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const player = await getPlayer(req.params.groupId, req.params.membershipId);
  const stats = await getPlayerStats(req.params.groupId, req.params.membershipId);
  res.json({ player, stats });
});

export const pending = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listPendingRequests(req.params.groupId));
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const result = await decideRequest(
    req.params.groupId,
    req.params.membershipId,
    req.auth!.userId,
    true,
  );
  res.json(result);
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const result = await decideRequest(
    req.params.groupId,
    req.params.membershipId,
    req.auth!.userId,
    false,
  );
  res.json(result);
});

export const setRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await changeRole(
    req.params.groupId,
    req.params.membershipId,
    req.auth!.userId,
    req.body.role,
  );
  res.json(result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await removePlayer(req.params.groupId, req.params.membershipId, req.auth!.userId);
  res.status(204).send();
});
