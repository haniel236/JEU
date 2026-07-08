import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode, shortSuffix, slugify } from '../utils/ids.js';
import { hashPassword } from './auth.service.js';
import { createNotification } from './notification.service.js';
import { recordAudit } from './audit.service.js';

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'groupe';
  let slug = base;
  // Ajoute un suffixe court jusqu'à obtenir un slug libre.
  while (await prisma.group.findUnique({ where: { slug } })) {
    slug = `${base}-${shortSuffix(4)}`;
  }
  return slug;
}

async function uniqueInviteCode(): Promise<string> {
  let code = generateInviteCode();
  while (await prisma.group.findUnique({ where: { inviteCode: code } })) {
    code = generateInviteCode();
  }
  return code;
}

/// Crée un groupe et son administrateur en une transaction.
export async function createGroup(input: {
  groupName: string;
  adminName: string;
  email: string;
  password: string;
  logoUrl?: string;
  adminPseudo?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('Un compte existe déjà avec cet e-mail');
  }

  const slug = await uniqueSlug(input.groupName);
  const inviteCode = await uniqueInviteCode();
  const passwordHash = await hashPassword(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.adminName.trim(), email, passwordHash },
    });
    const group = await tx.group.create({
      data: {
        name: input.groupName.trim(),
        slug,
        inviteCode,
        logoUrl: input.logoUrl,
        creatorId: user.id,
      },
    });
    const membership = await tx.membership.create({
      data: {
        userId: user.id,
        groupId: group.id,
        pseudo: (input.adminPseudo ?? input.adminName).trim(),
        role: 'ADMIN',
        status: 'ACCEPTED',
      },
    });
    return { user, group, membership };
  });

  await recordAudit({
    groupId: result.group.id,
    actorId: result.user.id,
    action: 'GROUP_CREATED',
    entity: 'Group',
    entityId: result.group.id,
  });

  return result.group;
}

/// Recherche un groupe par code d'invitation (ou slug).
export async function findGroupByCode(code: string) {
  const value = code.trim();
  const group = await prisma.group.findFirst({
    where: { OR: [{ inviteCode: value }, { slug: value.toLowerCase() }] },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  if (!group) {
    throw AppError.notFound('Aucun groupe ne correspond à ce code');
  }
  return group;
}

/// Demande d'adhésion : crée l'utilisateur (si besoin) et une membership PENDING.
export async function requestToJoin(input: {
  code: string;
  name: string;
  pseudo: string;
  email: string;
  password: string;
}) {
  const group = await findGroupByCode(input.code);
  const email = input.email.toLowerCase().trim();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await hashPassword(input.password);
    user = await prisma.user.create({
      data: { name: input.name.trim(), email, passwordHash },
    });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: group.id } },
  });
  if (existing) {
    if (existing.status === 'ACCEPTED') {
      throw AppError.conflict('Vous êtes déjà membre de ce groupe');
    }
    if (existing.status === 'PENDING') {
      throw AppError.conflict('Votre demande est déjà en attente de validation');
    }
  }

  const membership = existing
    ? await prisma.membership.update({
        where: { id: existing.id },
        data: { status: 'PENDING', pseudo: input.pseudo.trim() },
      })
    : await prisma.membership.create({
        data: {
          userId: user.id,
          groupId: group.id,
          pseudo: input.pseudo.trim(),
          role: 'PLAYER',
          status: 'PENDING',
        },
      });

  await createNotification({
    groupId: group.id,
    type: 'JOIN_REQUEST',
    title: 'Nouvelle demande d\'adhésion',
    message: `${input.pseudo.trim()} souhaite rejoindre le groupe`,
    data: { membershipId: membership.id },
  });

  await recordAudit({
    groupId: group.id,
    actorId: user.id,
    action: 'JOIN_REQUESTED',
    entity: 'Membership',
    entityId: membership.id,
  });

  return { groupId: group.id, membershipId: membership.id };
}

export async function getGroupOverview(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      slug: true,
      inviteCode: true,
      logoUrl: true,
      createdAt: true,
      creatorId: true,
    },
  });
  if (!group) {
    throw AppError.notFound('Groupe introuvable');
  }
  return group;
}

export async function updateGroup(
  groupId: string,
  actorUserId: string,
  data: { name?: string; logoUrl?: string | null },
) {
  const group = await prisma.group.update({
    where: { id: groupId },
    data: {
      name: data.name?.trim(),
      logoUrl: data.logoUrl,
    },
  });
  await recordAudit({
    groupId,
    actorId: actorUserId,
    action: 'GROUP_UPDATED',
    entity: 'Group',
    entityId: groupId,
  });
  return group;
}
