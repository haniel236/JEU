import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createGroup,
  findGroupByCode,
  getGroupOverview,
  requestToJoin,
  updateGroup,
} from '../services/group.service.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const group = await createGroup(req.body);
  res.status(201).json(group);
});

export const lookup = asyncHandler(async (req: Request, res: Response) => {
  const group = await findGroupByCode(String(req.query.code ?? ''));
  res.json(group);
});

export const join = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestToJoin(req.body);
  res.status(201).json(result);
});

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const group = await getGroupOverview(req.params.groupId);
  res.json(group);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const group = await updateGroup(req.params.groupId, req.auth!.userId, req.body);
  res.json(group);
});
