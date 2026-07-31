import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Workspace } from '../types/workspace';

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      activeWorkspaceId: null,
      setActiveWorkspace: (workspace: Workspace | null) =>
        set({
          activeWorkspace: workspace,
          activeWorkspaceId: workspace ? workspace.id : null,
        }),
      clearWorkspace: () =>
        set({
          activeWorkspace: null,
          activeWorkspaceId: null,
        }),
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
