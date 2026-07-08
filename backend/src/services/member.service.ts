import type { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { createNotification } from './notification.service.js';
import { recordAudit } from './audit.service.js';

const memberSelect = {
  id: true,
  pseudo: true,
  photoUrl: true,
  role: true,
  status: true,
  joinedAt: true,
  matchesPlayed: true,
  wins: true,
  losses: true,
  draws: true,
  user: { select: { id: true, name: true, email: true } },
} as const;

function withWinRate<T extends { matchesPlayed: number; wins: number }>(m: T) {
  const winRate = m.matchesPlayed > 0 ? Math.round((m.wins / m.matchesPlayed) * 1000) / 10 : 0;
  return { ...m, winRate };
}

/// Liste les joueurs acceptés d'un groupe avec leur rang (par victoires).
export async function listPlayers(groupId: string) {
  const players = await prisma.membership.findMany({
    where: { groupId, status: 'ACCEPTED' },
    select: memberSelect,
    orderBy: [{ wins: 'desc' }, { matchesPlayed: 'asc' }],
  });
  return players.map((p, index) => ({ ...withWinRate(p), rank: index + 1 }));
}

export async function listPendingRequests(groupId: string) {
  return prisma.membership.findMany({
    where: { groupId, status: 'PENDING' },
    select: memberSelect,
    orderBy: { joinedAt: 'asc' },
  });
}

export async function getPlayer(groupId: string, membershipId: string) {
  const player = await prisma.membership.findFirst({
    where: { id: membershipId, groupId },
    select: memberSelect,
  });
  if (!player) {
    throw AppError.notFound('Joueur introuvable');
  }
  const all = await listPlayers(groupId);
  const rank = all.find((p) => p.id === membershipId)?.rank ?? null;
  return { ...withWinRate(player), rank };
}

export async function decideRequest(
  groupId: string,
  membershipId: string,
  actorUserId: string,
  accept: boolean,
) {
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, groupId, status: 'PENDING' },
    include: { user: true },
  });
  if (!membership) {
    throw AppError.notFound('Demande introuvable ou déjà traitée');
  }

  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
  });

  await createNotification({
    groupId,
    userId: membership.userId,
    type: accept ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
    title: accept ? 'Demande acceptée' : 'Demande refusée',
    message: accept
      ? 'Bienvenue ! Votre adhésion a été validée.'
      : 'Votre demande d\'adhésion a été refusée.',
  });

  if (accept) {
    await createNotification({
      groupId,
      type: 'NEW_PLAYER',
      title: 'Nouveau joueur',
      message: `${membership.pseudo} a rejoint le groupe`,
      data: { membershipId: membership.id },
    });
  }

  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: accept ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
    entity: 'Membership',
    entityId: membership.id,
  });

  return updated;
}

export async function changeRole(
  groupId: string,
  membershipId: string,
  actorUserId: string,
  role: Role,
) {
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, groupId },
  });
  if (!membership) {
    throw AppError.notFound('Joueur introuvable');
  }
  if (role === 'PLAYER' && membership.role === 'ADMIN') {
    const adminCount = await prisma.membership.count({
      where: { groupId, role: 'ADMIN', status: 'ACCEPTED' },
    });
    if (adminCount <= 1) {
      throw AppError.badRequest('Impossible de retirer le dernier administrateur');
    }
  }
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { role },
  });
  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: 'ROLE_CHANGED',
    entity: 'Membership',
    entityId: membership.id,
    metadata: { role },
  });
  return updated;
}

export async function removePlayer(groupId: string, membershipId: string, actorUserId: string) {
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, groupId },
  });
  if (!membership) {
    throw AppError.notFound('Joueur introuvable');
  }
  if (membership.role === 'ADMIN') {
    const adminCount = await prisma.membership.count({
      where: { groupId, role: 'ADMIN', status: 'ACCEPTED' },
    });
    if (adminCount <= 1) {
      throw AppError.badRequest('Impossible de supprimer le dernier administrateur');
    }
  }
  await prisma.membership.delete({ where: { id: membership.id } });
  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: 'PLAYER_REMOVED',
    entity: 'Membership',
    entityId: membershipId,
  });
}
