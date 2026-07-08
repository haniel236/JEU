import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

const playerSelect = { id: true, pseudo: true, photoUrl: true } as const;

/// Compare deux joueurs d'un même groupe (confrontations directes).
export async function getHeadToHead(groupId: string, aId: string, bId: string) {
  if (aId === bId) {
    throw AppError.badRequest('Sélectionnez deux joueurs différents');
  }

  const [a, b] = await Promise.all([
    prisma.membership.findFirst({ where: { id: aId, groupId }, select: playerSelect }),
    prisma.membership.findFirst({ where: { id: bId, groupId }, select: playerSelect }),
  ]);
  if (!a || !b) {
    throw AppError.notFound('Joueur introuvable dans ce groupe');
  }

  const matches = await prisma.match.findMany({
    where: {
      groupId,
      OR: [
        { player1Id: aId, player2Id: bId },
        { player1Id: bId, player2Id: aId },
      ],
    },
    orderBy: { playedAt: 'desc' },
    include: {
      player1: { select: playerSelect },
      player2: { select: playerSelect },
      winner: { select: { id: true, pseudo: true } },
    },
  });

  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let aGoals = 0;
  let bGoals = 0;

  for (const m of matches) {
    const aIsP1 = m.player1Id === aId;
    aGoals += aIsP1 ? m.score1 : m.score2;
    bGoals += aIsP1 ? m.score2 : m.score1;
    if (m.winnerId === null) draws += 1;
    else if (m.winnerId === aId) aWins += 1;
    else bWins += 1;
  }

  const total = matches.length;
  const pct = (wins: number) => (total > 0 ? Math.round((wins / total) * 1000) / 10 : 0);

  return {
    playerA: { ...a, wins: aWins, goals: aGoals, winRate: pct(aWins) },
    playerB: { ...b, wins: bWins, goals: bGoals, winRate: pct(bWins) },
    totalMatches: total,
    draws,
    matches,
  };
}
