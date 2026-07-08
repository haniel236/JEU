import { prisma } from '../config/prisma.js';
import { startOfPeriod, type Period } from '../utils/dates.js';

export interface RankingRow {
  membershipId: string;
  pseudo: string;
  photoUrl: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rank: number;
}

function winRate(wins: number, played: number): number {
  return played > 0 ? Math.round((wins / played) * 1000) / 10 : 0;
}

/// Classement basé sur les compteurs dénormalisés (tout-temps).
async function allTimeRanking(groupId: string): Promise<RankingRow[]> {
  const players = await prisma.membership.findMany({
    where: { groupId, status: 'ACCEPTED' },
    select: {
      id: true,
      pseudo: true,
      photoUrl: true,
      matchesPlayed: true,
      wins: true,
      losses: true,
      draws: true,
    },
  });

  return players
    .map((p) => ({
      membershipId: p.id,
      pseudo: p.pseudo,
      photoUrl: p.photoUrl,
      matchesPlayed: p.matchesPlayed,
      wins: p.wins,
      losses: p.losses,
      draws: p.draws,
      winRate: winRate(p.wins, p.matchesPlayed),
    }))
    .sort(sortRanking)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/// Classement sur une fenêtre temporelle (semaine/mois/année) calculé depuis les matchs.
async function windowedRanking(groupId: string, period: Period): Promise<RankingRow[]> {
  const since = startOfPeriod(period);
  const [players, matches] = await Promise.all([
    prisma.membership.findMany({
      where: { groupId, status: 'ACCEPTED' },
      select: { id: true, pseudo: true, photoUrl: true },
    }),
    prisma.match.findMany({
      where: { groupId, playedAt: { gte: since } },
      select: { player1Id: true, player2Id: true, winnerId: true },
    }),
  ]);

  const stats = new Map<string, { wins: number; losses: number; draws: number; played: number }>();
  for (const p of players) {
    stats.set(p.id, { wins: 0, losses: 0, draws: 0, played: 0 });
  }
  for (const m of matches) {
    for (const pid of [m.player1Id, m.player2Id]) {
      const s = stats.get(pid);
      if (!s) continue;
      s.played += 1;
      if (m.winnerId === null) s.draws += 1;
      else if (m.winnerId === pid) s.wins += 1;
      else s.losses += 1;
    }
  }

  return players
    .map((p) => {
      const s = stats.get(p.id)!;
      return {
        membershipId: p.id,
        pseudo: p.pseudo,
        photoUrl: p.photoUrl,
        matchesPlayed: s.played,
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
        winRate: winRate(s.wins, s.played),
      };
    })
    .sort(sortRanking)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function sortRanking(a: Omit<RankingRow, 'rank'>, b: Omit<RankingRow, 'rank'>) {
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (b.winRate !== a.winRate) return b.winRate - a.winRate;
  return b.matchesPlayed - a.matchesPlayed;
}

export async function getRanking(groupId: string, period: Period | 'all'): Promise<RankingRow[]> {
  if (period === 'all') {
    return allTimeRanking(groupId);
  }
  return windowedRanking(groupId, period);
}

export async function getTopPlayers(groupId: string, limit = 10): Promise<RankingRow[]> {
  const ranking = await allTimeRanking(groupId);
  return ranking.slice(0, limit);
}
