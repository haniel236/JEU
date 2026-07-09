import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
  getPublicKey,
  removeSubscription,
  saveSubscription,
} from '../services/push.service.js';

export const publicKey = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ publicKey: getPublicKey() });
});

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const subscription = req.body?.subscription;
  if (!subscription?.endpoint) {
    throw AppError.badRequest('Abonnement push invalide');
  }
  await saveSubscription(req.auth!.userId, subscription, req.get('user-agent') ?? undefined);
  res.status(201).json({ ok: true });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const endpoint = req.body?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint) {
    throw AppError.badRequest('Endpoint manquant');
  }
  await removeSubscription(endpoint);
  res.json({ ok: true });
});
