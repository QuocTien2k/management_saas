import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/project-service';
import { CreateProjectInput, UpdateProjectInput } from '../types/project.types';

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectService.getProjects(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectService.createProject(data, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}

export function useUpdateProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
}

export function useDeleteProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}
