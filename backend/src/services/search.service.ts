import { prisma } from '../config/prisma.js';

const matchInclude = {
  player1: { select: { id: true, pseudo: true } },
  player2: { select: { id: true, pseudo: true } },
  winner: { select: { id: true, pseudo: true } },
} as const;

/// Recherche instantanée dans un groupe : joueurs, matchs, équipes utilisées.
export async function search(groupId: string, query: string) {
  const q = query.trim();
  if (q.length === 0) {
    return { players: [], matches: [], teams: [] };
  }

  const [players, matchesByTeam, matchesByPlayer] = await Promise.all([
    prisma.membership.findMany({
      where: {
        groupId,
        status: 'ACCEPTED',
        OR: [
          { pseudo: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: { id: true, pseudo: true, photoUrl: true, wins: true, matchesPlayed: true },
      take: 10,
    }),
    prisma.match.findMany({
      where: {
        groupId,
        OR: [
          { team1Name: { contains: q, mode: 'insensitive' } },
          { team2Name: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: matchInclude,
      orderBy: { playedAt: 'desc' },
      take: 10,
    }),
    prisma.match.findMany({
      where: {
        groupId,
        OR: [
          { player1: { pseudo: { contains: q, mode: 'insensitive' } } },
          { player2: { pseudo: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: matchInclude,
      orderBy: { playedAt: 'desc' },
      take: 10,
    }),
  ]);

  // Fusionne les matchs (par équipe et par joueur) sans doublon.
  const matchMap = new Map<string, (typeof matchesByTeam)[number]>();
  for (const m of [...matchesByTeam, ...matchesByPlayer]) {
    matchMap.set(m.id, m);
  }

  // Équipes distinctes correspondant à la recherche.
  const teamSet = new Set<string>();
  for (const m of matchesByTeam) {
    if (m.team1Name.toLowerCase().includes(q.toLowerCase())) teamSet.add(m.team1Name);
    if (m.team2Name.toLowerCase().includes(q.toLowerCase())) teamSet.add(m.team2Name);
  }

  return {
    players,
    matches: Array.from(matchMap.values()).slice(0, 15),
    teams: Array.from(teamSet).slice(0, 10),
  };
}
