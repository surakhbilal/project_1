import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ToastMessage, UserProfile } from '../types';
import {
  apiGetCurrentUser,
  apiLoginUser,
  apiLogoutUser,
  apiRegisterUser,
  checkBackendHealth,
  clearSavedToken,
  getSavedToken,
  saveToken,
} from '../services/api';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loadingAuth: boolean;
  backendHealthy: boolean;
  backendLatency: number;
  lastHealthTimestamp: string | null;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  inspectorOpen: boolean;
  toasts: ToastMessage[];
  openAuthModal: (tab: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setInspectorOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  pingHealth: () => Promise<void>;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => getSavedToken());
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(true);
  const [backendLatency, setBackendLatency] = useState<number>(0);
  const [lastHealthTimestamp, setLastHealthTimestamp] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast],
  );

  const pingHealth = useCallback(async () => {
    const res = await checkBackendHealth();
    setBackendHealthy(res.ok);
    setBackendLatency(res.latencyMs);
    if (res.data?.timestamp) {
      setLastHealthTimestamp(res.data.timestamp);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const activeToken = getSavedToken();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await apiGetCurrentUser(activeToken);
      setUser(res.data);
      setToken(activeToken);
    } catch {
      clearSavedToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    pingHealth();
    refreshCurrentUser();
  }, [pingHealth, refreshCurrentUser]);

  const openAuthModal = useCallback((tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLoginUser({ email, password });
      const newToken = res.data;
      saveToken(newToken);
      setToken(newToken);

      const profileRes = await apiGetCurrentUser(newToken);
      setUser(profileRes.data);
      setAuthModalOpen(false);

      pushToast({
        type: 'success',
        title: `Selamat datang kembali, ${profileRes.data.name}!`,
        description: 'Sesi KTM Terverifikasi berhasil diaktifkan.',
      });
    },
    [pushToast],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiRegisterUser({ name, email, password });
      pushToast({
        type: 'success',
        title: 'Registrasi Mahasiswa Berhasil!',
        description: 'Membuat sesi login otomatis untuk akun Anda...',
      });
      await login(email, password);
    },
    [login, pushToast],
  );

  const logout = useCallback(async () => {
    const currentToken = token || getSavedToken();
    try {
      if (currentToken) {
        await apiLogoutUser(currentToken);
      }
    } catch {
      // tetap hapus token lokal walaupun sesi di server sudah kedaluwarsa
    } finally {
      clearSavedToken();
      setToken(null);
      setUser(null);
      pushToast({
        type: 'info',
        title: 'Berhasil Logout',
        description: 'Token sesi Anda telah dihapus dari tabel sessions di database.',
      });
    }
  }, [token, pushToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loadingAuth,
        backendHealthy,
        backendLatency,
        lastHealthTimestamp,
        authModalOpen,
        authModalTab,
        inspectorOpen,
        toasts,
        openAuthModal,
        closeAuthModal,
        setInspectorOpen,
        login,
        register,
        logout,
        refreshCurrentUser,
        pingHealth,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipanggil di dalam AuthProvider');
  }
  return ctx;
}
