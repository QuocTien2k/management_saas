import { create } from 'zustand';
import { useWorkspaceStore } from '@/features/workspace/store/workspace-store';

export interface User {
  id: string;
  email: string;
  fullname: string;
  role: string;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_session=true; path=/; max-age=604800; SameSite=Lax';
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
    }
    useWorkspaceStore.getState().clearWorkspace();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
