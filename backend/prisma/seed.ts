import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEAMS = ['Real Madrid', 'FC Barcelone', 'Manchester City', 'PSG', 'Bayern', 'Liverpool'];

function resolveWinner(p1: string, p2: string, s1: number, s2: number): string | null {
  if (s1 > s2) return p1;
  if (s2 > s1) return p2;
  return null;
}

async function main() {
  console.log('🌱 Réinitialisation des données de démonstration...');
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: { name: 'Haniel', email: 'admin@zmj.dev', passwordHash },
  });

  const group = await prisma.group.create({
    data: {
      name: 'Les Légendes FC',
      slug: 'les-legendes-fc',
      inviteCode: 'DEMO-2026',
      creatorId: admin.id,
    },
  });

  const adminMembership = await prisma.membership.create({
    data: {
      userId: admin.id,
      groupId: group.id,
      pseudo: 'ElHaniel',
      role: 'ADMIN',
      status: 'ACCEPTED',
    },
  });

  const players = [adminMembership];
  const names = ['Karim', 'Sadio', 'Vinicius', 'Kylian', 'Erling'];
  for (const name of names) {
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@zmj.dev`,
        passwordHash,
      },
    });
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        groupId: group.id,
        pseudo: name,
        role: 'PLAYER',
        status: 'ACCEPTED',
      },
    });
    players.push(membership);
  }

  // Génère ~40 matchs aléatoires sur les 60 derniers jours.
  for (let i = 0; i < 40; i += 1) {
    const a = players[Math.floor(Math.random() * players.length)];
    let b = players[Math.floor(Math.random() * players.length)];
    while (b.id === a.id) {
      b = players[Math.floor(Math.random() * players.length)];
    }
    const score1 = Math.floor(Math.random() * 6);
    const score2 = Math.floor(Math.random() * 6);
    const winnerId = resolveWinner(a.id, b.id, score1, score2);
    const playedAt = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);

    await prisma.match.create({
      data: {
        groupId: group.id,
        player1Id: a.id,
        player2Id: b.id,
        team1Name: TEAMS[Math.floor(Math.random() * TEAMS.length)],
        team2Name: TEAMS[Math.floor(Math.random() * TEAMS.length)],
        score1,
        score2,
        winnerId,
        createdById: adminMembership.id,
        playedAt,
      },
    });

    await prisma.membership.update({
      where: { id: a.id },
      data: {
        matchesPlayed: { increment: 1 },
        wins: { increment: winnerId === a.id ? 1 : 0 },
        losses: { increment: winnerId && winnerId !== a.id ? 1 : 0 },
        draws: { increment: winnerId === null ? 1 : 0 },
      },
    });
    await prisma.membership.update({
      where: { id: b.id },
      data: {
        matchesPlayed: { increment: 1 },
        wins: { increment: winnerId === b.id ? 1 : 0 },
        losses: { increment: winnerId && winnerId !== b.id ? 1 : 0 },
        draws: { increment: winnerId === null ? 1 : 0 },
      },
    });
  }

  console.log('✅ Données de démonstration créées.');
  console.log('   Groupe :', group.name, '| Code :', group.inviteCode);
  console.log('   Admin  : admin@zmj.dev / password123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
