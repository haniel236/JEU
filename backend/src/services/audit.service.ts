import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

interface AuditInput {
  groupId: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/// Journalise une action importante (best-effort, ne bloque jamais la requête).
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        groupId: input.groupId,
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    console.error('Échec de journalisation AuditLog', err);
  }
}

export async function listAudit(groupId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { actor: { select: { id: true, name: true, email: true } } },
  });
}
