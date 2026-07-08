import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { createNotification } from './notification.service.js';
import { recordAudit } from './audit.service.js';

type Tx = Prisma.TransactionClient | PrismaClient;

interface MatchInput {
  player1Id: string;
  team1Name: string;
  player2Id: string;
  team2Name: string;
  score1: number;
  score2: number;
  playedAt?: string;
}

const matchInclude = {
  player1: { select: { id: true, pseudo: true, photoUrl: true } },
  player2: { select: { id: true, pseudo: true, photoUrl: true } },
  winner: { select: { id: true, pseudo: true } },
  createdBy: { select: { id: true, pseudo: true } },
} as const;

function resolveWinner(player1Id: string, player2Id: string, score1: number, score2: number) {
  if (score1 > score2) return player1Id;
  if (score2 > score1) return player2Id;
  return null;
}

/// Applique les deltas de statistiques d'un match (sens = +1 création, -1 annulation).
async function applyStatDelta(
  tx: Tx,
  match: { player1Id: string; player2Id: string; winnerId: string | null },
  sign: 1 | -1,
) {
  const { player1Id, player2Id, winnerId } = match;
  const isDraw = winnerId === null;

  await tx.membership.update({
    where: { id: player1Id },
    data: {
      matchesPlayed: { increment: sign },
      wins: { increment: winnerId === player1Id ? sign : 0 },
      losses: { increment: !isDraw && winnerId !== player1Id ? sign : 0 },
      draws: { increment: isDraw ? sign : 0 },
    },
  });
  await tx.membership.update({
    where: { id: player2Id },
    data: {
      matchesPlayed: { increment: sign },
      wins: { increment: winnerId === player2Id ? sign : 0 },
      losses: { increment: !isDraw && winnerId !== player2Id ? sign : 0 },
      draws: { increment: isDraw ? sign : 0 },
    },
  });
}

async function currentLeaderId(groupId: string): Promise<string | null> {
  const leader = await prisma.membership.findFirst({
    where: { groupId, status: 'ACCEPTED', matchesPlayed: { gt: 0 } },
    orderBy: [{ wins: 'desc' }, { matchesPlayed: 'asc' }],
    select: { id: true },
  });
  return leader?.id ?? null;
}

async function assertGroupPlayers(groupId: string, ids: string[]) {
  const count = await prisma.membership.count({
    where: { id: { in: ids }, groupId, status: 'ACCEPTED' },
  });
  if (count !== ids.length) {
    throw AppError.badRequest('Les deux joueurs doivent être membres actifs du groupe');
  }
}

export async function createMatch(groupId: string, createdById: string | null, input: MatchInput) {
  if (input.player1Id === input.player2Id) {
    throw AppError.badRequest('Un joueur ne peut pas jouer contre lui-même');
  }
  await assertGroupPlayers(groupId, [input.player1Id, input.player2Id]);

  const winnerId = resolveWinner(input.player1Id, input.player2Id, input.score1, input.score2);
  const leaderBefore = await currentLeaderId(groupId);

  const match = await prisma.$transaction(async (tx) => {
    const created = await tx.match.create({
      data: {
        groupId,
        player1Id: input.player1Id,
        team1Name: input.team1Name.trim(),
        player2Id: input.player2Id,
        team2Name: input.team2Name.trim(),
        score1: input.score1,
        score2: input.score2,
        winnerId,
        createdById,
        playedAt: input.playedAt ? new Date(input.playedAt) : new Date(),
      },
      include: matchInclude,
    });
    await applyStatDelta(tx, created, 1);
    return created;
  });

  await createNotification({
    groupId,
    type: 'NEW_MATCH',
    title: 'Nouveau match',
    message: `${match.player1.pseudo} ${match.score1} - ${match.score2} ${match.player2.pseudo}`,
    data: { matchId: match.id },
  });

  // Détection d'un nouveau numéro 1.
  const leaderAfter = await currentLeaderId(groupId);
  if (leaderAfter && leaderAfter !== leaderBefore) {
    const leader = await prisma.membership.findUnique({
      where: { id: leaderAfter },
      select: { pseudo: true },
    });
    if (leader) {
      await createNotification({
        groupId,
        type: 'NEW_NUMBER_ONE',
        title: 'Nouveau numéro 1',
        message: `${leader.pseudo} prend la tête du classement`,
        data: { membershipId: leaderAfter },
      });
    }
  }

  // Détection d'un nouveau record de buts sur un match.
  const totalGoals = input.score1 + input.score2;
  const previousRecord = await prisma.match.aggregate({
    where: { groupId, id: { not: match.id } },
    _max: { score1: true, score2: true },
  });
  const bestSingle = Math.max(previousRecord._max.score1 ?? 0, previousRecord._max.score2 ?? 0);
  if (Math.max(input.score1, input.score2) > bestSingle && bestSingle > 0) {
    await createNotification({
      groupId,
      type: 'NEW_RECORD',
      title: 'Nouveau record',
      message: `Record de buts : ${Math.max(input.score1, input.score2)} dans un match !`,
      data: { matchId: match.id, totalGoals },
    });
  }

  await recordAudit({
    groupId,
    actorId: null,
    action: 'MATCH_CREATED',
    entity: 'Match',
    entityId: match.id,
  });

  return match;
}

export async function listMatches(
  groupId: string,
  options: { page?: number; pageSize?: number; playerId?: string } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 15));
  const where: Prisma.MatchWhereInput = { groupId };
  if (options.playerId) {
    where.OR = [{ player1Id: options.playerId }, { player2Id: options.playerId }];
  }

  const [items, total] = await Promise.all([
    prisma.match.findMany({
      where,
      include: matchInclude,
      orderBy: { playedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.match.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateMatch(
  groupId: string,
  matchId: string,
  actorUserId: string,
  input: MatchInput,
) {
  const existing = await prisma.match.findFirst({ where: { id: matchId, groupId } });
  if (!existing) {
    throw AppError.notFound('Match introuvable');
  }
  if (input.player1Id === input.player2Id) {
    throw AppError.badRequest('Un joueur ne peut pas jouer contre lui-même');
  }
  await assertGroupPlayers(groupId, [input.player1Id, input.player2Id]);

  const winnerId = resolveWinner(input.player1Id, input.player2Id, input.score1, input.score2);

  const updated = await prisma.$transaction(async (tx) => {
    // Annule l'effet de l'ancien match puis applique le nouveau.
    await applyStatDelta(tx, existing, -1);
    const result = await tx.match.update({
      where: { id: matchId },
      data: {
        player1Id: input.player1Id,
        team1Name: input.team1Name.trim(),
        player2Id: input.player2Id,
        team2Name: input.team2Name.trim(),
        score1: input.score1,
        score2: input.score2,
        winnerId,
        playedAt: input.playedAt ? new Date(input.playedAt) : existing.playedAt,
      },
      include: matchInclude,
    });
    await applyStatDelta(tx, result, 1);
    return result;
  });

  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: 'MATCH_UPDATED',
    entity: 'Match',
    entityId: matchId,
  });

  return updated;
}

export async function deleteMatch(groupId: string, matchId: string, actorUserId: string) {
  const existing = await prisma.match.findFirst({ where: { id: matchId, groupId } });
  if (!existing) {
    throw AppError.notFound('Match introuvable');
  }
  await prisma.$transaction(async (tx) => {
    await applyStatDelta(tx, existing, -1);
    await tx.match.delete({ where: { id: matchId } });
  });
  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: 'MATCH_DELETED',
    entity: 'Match',
    entityId: matchId,
  });
}
