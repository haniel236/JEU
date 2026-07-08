import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../services/endpoints.js';
import { setAccessToken, setUnauthorizedHandler } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';
import type { User } from '../types/index.js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (accessToken: string, user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((accessToken: string, nextUser: User) => {
    setAccessToken(accessToken);
    setUser(nextUser);
    connectSocket(accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setSession(res.accessToken, res.user);
      setUser(await authApi.me());
    },
    [setSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authApi.register({ name, email, password });
      setSession(res.accessToken, res.user);
      setUser(await authApi.me());
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  // Bootstrap : tente un refresh silencieux au chargement.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await authApi.refresh();
        if (!active) return;
        setSession(res.accessToken, res.user);
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [setSession, clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setSession, refreshUser }),
    [user, loading, login, register, logout, setSession, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
