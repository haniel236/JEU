import { prisma } from '../config/prisma.js';
import { startOfDay, startOfMonth, startOfWeek, startOfYear } from '../utils/dates.js';
import { getTopPlayers } from './ranking.service.js';

const matchInclude = {
  player1: { select: { id: true, pseudo: true, photoUrl: true } },
  player2: { select: { id: true, pseudo: true, photoUrl: true } },
  winner: { select: { id: true, pseudo: true } },
} as const;

/// Agrège les indicateurs du tableau de bord d'un groupe.
export async function getDashboard(groupId: string) {
  const now = new Date();
  const [
    playersCount,
    totalMatches,
    today,
    week,
    month,
    year,
    top,
    recentMatches,
  ] = await Promise.all([
    prisma.membership.count({ where: { groupId, status: 'ACCEPTED' } }),
    prisma.match.count({ where: { groupId } }),
    prisma.match.count({ where: { groupId, playedAt: { gte: startOfDay(now) } } }),
    prisma.match.count({ where: { groupId, playedAt: { gte: startOfWeek(now) } } }),
    prisma.match.count({ where: { groupId, playedAt: { gte: startOfMonth(now) } } }),
    prisma.match.count({ where: { groupId, playedAt: { gte: startOfYear(now) } } }),
    getTopPlayers(groupId, 10),
    prisma.match.findMany({
      where: { groupId },
      include: matchInclude,
      orderBy: { playedAt: 'desc' },
      take: 8,
    }),
  ]);

  return {
    counts: {
      players: playersCount,
      totalMatches,
      today,
      week,
      month,
      year,
    },
    top,
    recentMatches,
  };
}

/// Statistiques détaillées d'un joueur (tout-temps + fenêtres temporelles).
export async function getPlayerStats(groupId: string, membershipId: string) {
  const now = new Date();
  const windows = {
    week: startOfWeek(now),
    month: startOfMonth(now),
    year: startOfYear(now),
  };

  const matches = await prisma.match.findMany({
    where: {
      groupId,
      OR: [{ player1Id: membershipId }, { player2Id: membershipId }],
    },
    select: { playedAt: true, winnerId: true },
  });

  const buckets = {
    all: { played: 0, wins: 0, losses: 0, draws: 0 },
    week: { played: 0, wins: 0, losses: 0, draws: 0 },
    month: { played: 0, wins: 0, losses: 0, draws: 0 },
    year: { played: 0, wins: 0, losses: 0, draws: 0 },
  };

  const add = (bucket: (typeof buckets)['all'], winnerId: string | null) => {
    bucket.played += 1;
    if (winnerId === null) bucket.draws += 1;
    else if (winnerId === membershipId) bucket.wins += 1;
    else bucket.losses += 1;
  };

  for (const m of matches) {
    add(buckets.all, m.winnerId);
    if (m.playedAt >= windows.week) add(buckets.week, m.winnerId);
    if (m.playedAt >= windows.month) add(buckets.month, m.winnerId);
    if (m.playedAt >= windows.year) add(buckets.year, m.winnerId);
  }

  const withRate = (b: (typeof buckets)['all']) => ({
    ...b,
    winRate: b.played > 0 ? Math.round((b.wins / b.played) * 1000) / 10 : 0,
  });

  return {
    all: withRate(buckets.all),
    week: withRate(buckets.week),
    month: withRate(buckets.month),
    year: withRate(buckets.year),
  };
}
