import type { AuditLog } from '../types/index.js';

export type AuditTone = 'neutral' | 'positive' | 'danger';

export interface AuditDescription {
  label: string;
  tone: AuditTone;
}

/// Traduit une entrée du journal d'audit en une phrase claire et non technique.
export function describeAudit(log: AuditLog): AuditDescription {
  const actor = log.actor?.name?.trim() || 'Système';
  const role = (log.metadata?.role as string | undefined) ?? undefined;

  switch (log.action) {
    case 'GROUP_CREATED':
      return { label: `${actor} a créé le groupe`, tone: 'positive' };
    case 'GROUP_UPDATED':
      return { label: `${actor} a modifié les paramètres du groupe`, tone: 'neutral' };
    case 'JOIN_REQUESTED':
      return { label: `${actor} a demandé à rejoindre le groupe`, tone: 'neutral' };
    case 'REQUEST_ACCEPTED':
      return { label: `${actor} a accepté une demande d'adhésion`, tone: 'positive' };
    case 'REQUEST_REJECTED':
      return { label: `${actor} a refusé une demande d'adhésion`, tone: 'danger' };
    case 'ROLE_CHANGED':
      return {
        label:
          role === 'ADMIN'
            ? `${actor} a promu un membre administrateur`
            : `${actor} a rétrogradé un membre en joueur`,
        tone: 'neutral',
      };
    case 'PLAYER_REMOVED':
      return { label: `${actor} a retiré un joueur du groupe`, tone: 'danger' };
    case 'MATCH_CREATED':
      return { label: 'Nouveau match enregistré', tone: 'positive' };
    case 'MATCH_UPDATED':
      return { label: `${actor} a modifié un match`, tone: 'neutral' };
    case 'MATCH_DELETED':
      return { label: `${actor} a supprimé un match`, tone: 'danger' };
    default:
      return { label: 'Action enregistrée', tone: 'neutral' };
  }
}
