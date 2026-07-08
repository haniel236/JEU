export type Role = 'ADMIN' | 'PLAYER';
export type MembershipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type NotificationType =
  | 'NEW_MATCH'
  | 'NEW_PLAYER'
  | 'NEW_NUMBER_ONE'
  | 'RANKING_CHANGED'
  | 'NEW_RECORD'
  | 'JOIN_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  memberships?: MembershipSummary[];
}

export interface MembershipSummary {
  id: string;
  pseudo: string;
  role: Role;
  status: MembershipStatus;
  group: GroupSummary;
}

export interface GroupSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface Group extends GroupSummary {
  inviteCode: string;
  createdAt: string;
  creatorId: string;
}

export interface Player {
  id: string;
  pseudo: string;
  photoUrl: string | null;
  role: Role;
  status: MembershipStatus;
  joinedAt: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rank?: number | null;
  user: { id: string; name: string; email: string };
}

export interface PlayerRef {
  id: string;
  pseudo: string;
  photoUrl?: string | null;
}

export interface Match {
  id: string;
  team1Name: string;
  team2Name: string;
  score1: number;
  score2: number;
  playedAt: string;
  createdAt: string;
  player1: PlayerRef;
  player2: PlayerRef;
  winner: { id: string; pseudo: string } | null;
  createdBy?: { id: string; pseudo: string } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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

export interface DashboardData {
  counts: {
    players: number;
    totalMatches: number;
    today: number;
    week: number;
    month: number;
    year: number;
  };
  top: RankingRow[];
  recentMatches: Match[];
}

export interface StatBucket {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface PlayerStats {
  all: StatBucket;
  week: StatBucket;
  month: StatBucket;
  year: StatBucket;
}

export interface HeadToHead {
  playerA: PlayerRef & { wins: number; goals: number; winRate: number };
  playerB: PlayerRef & { wins: number; goals: number; winRate: number };
  totalMatches: number;
  draws: number;
  matches: Match[];
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  groupId: string;
  userId: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

export interface SearchResults {
  players: Array<Pick<Player, 'id' | 'pseudo' | 'photoUrl' | 'wins' | 'matchesPlayed'>>;
  matches: Match[];
  teams: string[];
}
