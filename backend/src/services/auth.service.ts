import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
}

function issueTokens(user: { id: string; name: string; email: string }): AuthResult {
  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email }),
    refreshToken: signRefreshToken(user.id),
    user,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('Un compte existe déjà avec cet e-mail');
  }
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash },
    select: { id: true, name: true, email: true },
  });
  return issueTokens(user);
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw AppError.unauthorized('Identifiants invalides');
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw AppError.unauthorized('Identifiants invalides');
  }
  return issueTokens({ id: user.id, name: user.name, email: user.email });
}

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Refresh token invalide ou expiré');
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    throw AppError.unauthorized('Utilisateur introuvable');
  }
  return issueTokens(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      memberships: {
        where: { status: 'ACCEPTED' },
        select: {
          id: true,
          pseudo: true,
          role: true,
          status: true,
          group: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
      },
    },
  });
  if (!user) {
    throw AppError.notFound('Utilisateur introuvable');
  }
  return user;
}
