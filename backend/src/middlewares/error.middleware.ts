import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route introuvable' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Données invalides',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Cette ressource existe déjà' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Ressource introuvable' });
      return;
    }
  }

  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(env.isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
