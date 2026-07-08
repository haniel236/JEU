import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';

/// Vérifie le token d'accès et attache `req.auth`.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token d\'accès manquant'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(AppError.unauthorized('Token d\'accès invalide ou expiré'));
  }
}

/// Vérifie que l'utilisateur est membre ACCEPTED du groupe (`:groupId`) et attache `req.membership`.
export function requireMembership(role?: 'ADMIN') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw AppError.unauthorized();
      }
      const groupId = req.params.groupId;
      if (!groupId) {
        throw AppError.badRequest('Identifiant de groupe manquant');
      }
      const membership = await prisma.membership.findUnique({
        where: { userId_groupId: { userId: req.auth.userId, groupId } },
        select: { id: true, groupId: true, role: true, status: true },
      });
      if (!membership || membership.status !== 'ACCEPTED') {
        throw AppError.forbidden('Vous n\'êtes pas membre de ce groupe');
      }
      if (role === 'ADMIN' && membership.role !== 'ADMIN') {
        throw AppError.forbidden('Action réservée aux administrateurs');
      }
      req.membership = {
        id: membership.id,
        groupId: membership.groupId,
        role: membership.role,
      };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
