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
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),
  clearAuth: () => {
    useWorkspaceStore.getState().clearWorkspace();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
