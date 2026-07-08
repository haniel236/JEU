import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from './AuthContext.js';
import type { MembershipSummary, Role } from '../types/index.js';

interface GroupContextValue {
  groupId: string;
  membership: MembershipSummary | null;
  role: Role | null;
  isAdmin: boolean;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ groupId, children }: { groupId: string; children: ReactNode }) {
  const { user } = useAuth();

  const value = useMemo<GroupContextValue>(() => {
    const membership =
      user?.memberships?.find((m) => m.group.id === groupId && m.status === 'ACCEPTED') ?? null;
    return {
      groupId,
      membership,
      role: membership?.role ?? null,
      isAdmin: membership?.role === 'ADMIN',
    };
  }, [user, groupId]);

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGroup(): GroupContextValue {
  const ctx = useContext(GroupContext);
  if (!ctx) {
    throw new Error('useGroup doit être utilisé dans GroupProvider');
  }
  return ctx;
}
