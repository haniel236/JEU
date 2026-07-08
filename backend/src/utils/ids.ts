import crypto from 'node:crypto';

/// Transforme un nom en slug URL-safe.
export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

/// Suffixe aléatoire court pour garantir l'unicité d'un slug.
export function shortSuffix(length = 6): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length).toLowerCase();
}

/// Code d'invitation lisible (ex: 7KQ3-9FZ2).
export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () =>
    Array.from({ length: 4 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
  return `${pick()}-${pick()}`;
}
