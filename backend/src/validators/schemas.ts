import { z } from 'zod';

const password = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(100);
const email = z.string().email('Adresse e-mail invalide');
const name = z.string().min(2, 'Trop court').max(60);

export const registerSchema = z.object({
  name,
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const createGroupSchema = z.object({
  groupName: z.string().min(2).max(60),
  adminName: name,
  email,
  password,
  logoUrl: z.string().url().optional(),
  adminPseudo: z.string().min(2).max(30).optional(),
});

export const joinGroupSchema = z.object({
  code: z.string().min(2).max(60),
  name,
  pseudo: z.string().min(2).max(30),
  email,
  password,
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

const score = z.coerce.number().int().min(0).max(99);

export const matchSchema = z.object({
  player1Id: z.string().min(1),
  team1Name: z.string().min(1).max(60),
  player2Id: z.string().min(1),
  team2Name: z.string().min(1).max(60),
  score1: score,
  score2: score,
  playedAt: z.string().datetime().optional(),
});

export const roleSchema = z.object({
  role: z.enum(['ADMIN', 'PLAYER']),
});

export const periodQuerySchema = z.object({
  period: z.enum(['all', 'week', 'month', 'year']).default('all'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(15),
  playerId: z.string().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(60),
});

export const headToHeadQuerySchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
});
