import { api } from './api.js';
import type {
  AppNotification,
  AuditLog,
  DashboardData,
  Group,
  GroupSummary,
  HeadToHead,
  Match,
  Paginated,
  Player,
  PlayerStats,
  RankingRow,
  Role,
  SearchResults,
  User,
} from '../types/index.js';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// --- Auth ---
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  refresh: () => api.post<AuthResponse>('/auth/refresh').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

// --- Groupes ---
export const groupApi = {
  create: (body: {
    groupName: string;
    adminName: string;
    email: string;
    password: string;
    adminPseudo?: string;
    logoUrl?: string;
  }) => api.post<Group>('/groups', body).then((r) => r.data),
  lookup: (code: string) =>
    api.get<GroupSummary>('/groups/lookup', { params: { code } }).then((r) => r.data),
  join: (body: { code: string; name: string; pseudo: string; email: string; password: string }) =>
    api.post<{ groupId: string; membershipId: string }>('/groups/join', body).then((r) => r.data),
  overview: (groupId: string) => api.get<Group>(`/groups/${groupId}`).then((r) => r.data),
  update: (groupId: string, body: { name?: string; logoUrl?: string | null }) =>
    api.patch<Group>(`/groups/${groupId}`, body).then((r) => r.data),
  dashboard: (groupId: string) =>
    api.get<DashboardData>(`/groups/${groupId}/dashboard`).then((r) => r.data),
};

// --- Joueurs ---
export const playerApi = {
  list: (groupId: string) => api.get<Player[]>(`/groups/${groupId}/players`).then((r) => r.data),
  detail: (groupId: string, membershipId: string) =>
    api
      .get<{ player: Player; stats: PlayerStats }>(`/groups/${groupId}/players/${membershipId}`)
      .then((r) => r.data),
};

// --- Matchs ---
export const matchApi = {
  list: (groupId: string, params: { page?: number; pageSize?: number; playerId?: string } = {}) =>
    api.get<Paginated<Match>>(`/groups/${groupId}/matches`, { params }).then((r) => r.data),
  create: (
    groupId: string,
    body: {
      player1Id: string;
      team1Name: string;
      player2Id: string;
      team2Name: string;
      score1: number;
      score2: number;
    },
  ) => api.post<Match>(`/groups/${groupId}/matches`, body).then((r) => r.data),
  update: (
    groupId: string,
    matchId: string,
    body: {
      player1Id: string;
      team1Name: string;
      player2Id: string;
      team2Name: string;
      score1: number;
      score2: number;
    },
  ) => api.put<Match>(`/groups/${groupId}/matches/${matchId}`, body).then((r) => r.data),
  remove: (groupId: string, matchId: string) =>
    api.delete(`/groups/${groupId}/matches/${matchId}`).then((r) => r.data),
};

// --- Classements & confrontations ---
export const rankingApi = {
  get: (groupId: string, period: 'all' | 'week' | 'month' | 'year') =>
    api
      .get<RankingRow[]>(`/groups/${groupId}/rankings`, { params: { period } })
      .then((r) => r.data),
  headToHead: (groupId: string, a: string, b: string) =>
    api.get<HeadToHead>(`/groups/${groupId}/head-to-head`, { params: { a, b } }).then((r) => r.data),
};

// --- Recherche ---
export const searchApi = {
  search: (groupId: string, q: string) =>
    api.get<SearchResults>(`/groups/${groupId}/search`, { params: { q } }).then((r) => r.data),
};

// --- Notifications ---
export const notificationApi = {
  list: (groupId: string) =>
    api
      .get<{ items: AppNotification[]; unread: number }>(`/groups/${groupId}/notifications`)
      .then((r) => r.data),
  markRead: (groupId: string, id: string) =>
    api.post(`/groups/${groupId}/notifications/${id}/read`).then((r) => r.data),
  markAllRead: (groupId: string) =>
    api.post(`/groups/${groupId}/notifications/read-all`).then((r) => r.data),
};

// --- Administration ---
export const adminApi = {
  requests: (groupId: string) =>
    api.get<Player[]>(`/groups/${groupId}/admin/requests`).then((r) => r.data),
  accept: (groupId: string, membershipId: string) =>
    api.post(`/groups/${groupId}/admin/requests/${membershipId}/accept`).then((r) => r.data),
  reject: (groupId: string, membershipId: string) =>
    api.post(`/groups/${groupId}/admin/requests/${membershipId}/reject`).then((r) => r.data),
  setRole: (groupId: string, membershipId: string, role: Role) =>
    api
      .patch(`/groups/${groupId}/admin/members/${membershipId}/role`, { role })
      .then((r) => r.data),
  removeMember: (groupId: string, membershipId: string) =>
    api.delete(`/groups/${groupId}/admin/members/${membershipId}`).then((r) => r.data),
  audit: (groupId: string) =>
    api.get<AuditLog[]>(`/groups/${groupId}/admin/audit`).then((r) => r.data),
};
