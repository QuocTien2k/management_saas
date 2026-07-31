import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services/workspace-service';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../types/workspace';
import { useWorkspaceStore } from '../store/workspace-store';

export const WORKSPACE_KEYS = {
  all: ['workspaces'] as const,
  lists: () => [...WORKSPACE_KEYS.all, 'list'] as const,
  detail: (id: string) => [...WORKSPACE_KEYS.all, 'detail', id] as const,
};

// Hook lấy danh sách workspace của user
export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACE_KEYS.lists(),
    queryFn: () => workspaceService.getWorkspaces(),
  });
}

// Hook lấy chi tiết 1 workspace
export function useWorkspaceDetail(id: string | null) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.detail(id || ''),
    queryFn: () => workspaceService.getWorkspaceById(id!),
    enabled: !!id,
  });
}

// Hook tạo workspace mới
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: (data: CreateWorkspaceInput) => workspaceService.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      setActiveWorkspace(newWorkspace);
    },
  });
}

// Hook cập nhật workspace
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceInput }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(updatedWorkspace.id) });
      if (activeWorkspace?.id === updatedWorkspace.id) {
        setActiveWorkspace(updatedWorkspace);
      }
    },
  });
}

// Hook xóa workspace
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { activeWorkspace, clearWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      if (activeWorkspace?.id === deletedId) {
        clearWorkspace();
      }
    },
  });
}
