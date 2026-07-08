import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createMatch,
  deleteMatch,
  listMatches,
  updateMatch,
} from '../services/match.service.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const match = await createMatch(req.params.groupId, req.membership!.id, req.body);
  res.status(201).json(match);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listMatches(req.params.groupId, {
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    playerId: req.query.playerId as string | undefined,
  });
  res.json(result);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const match = await updateMatch(
    req.params.groupId,
    req.params.matchId,
    req.auth!.userId,
    req.body,
  );
  res.json(match);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteMatch(req.params.groupId, req.params.matchId, req.auth!.userId);
  res.status(204).send();
});
