import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task-service';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput, MoveTaskInput, TaskFilters } from '../types/task.types';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/error';

export function useProjectTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => taskService.getProjectTasks(projectId, filters),
    enabled: Boolean(projectId),
    refetchOnWindowFocus: true,
  });
}

export function useWorkspaceTasks(projectIds: string[]) {
  const results = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ['tasks', projectId],
      queryFn: () => taskService.getProjectTasks(projectId),
      enabled: Boolean(projectId),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const tasks = results.flatMap((r) => (r.data ? r.data : []));

  return { tasks, isLoading };
}

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => (taskId ? taskService.getTaskById(taskId) : Promise.reject('No task id')),
    enabled: Boolean(taskId),
    refetchOnWindowFocus: true,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => taskService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      taskService.updateTask(taskId, data),
    onSuccess: (updatedTask, variables) => {
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks', projectId] }, (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((t) => (t.id === variables.taskId ? { ...t, ...updatedTask } : t));
      });
      queryClient.setQueryData<Task>(['task', variables.taskId], (oldTask) => {
        return oldTask ? { ...oldTask, ...updatedTask } : updatedTask;
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Không thể cập nhật công việc.'));
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Không thể xóa công việc.'));
    },
  });
}

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: MoveTaskInput }) =>
      taskService.moveTask(taskId, data),
    // Optimistic Update
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasksList = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks', projectId] });

      // Cập nhật giao diện ngay lập tức
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks', projectId] }, (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.map((t) =>
          t.id === taskId
            ? { ...t, status: (data.columnId as TaskStatus), position: data.position }
            : t
        );
      });

      return { previousTasksList };
    },
    onError: (err, newMove, context) => {
      // Rollback nếu API báo lỗi
      if (context?.previousTasksList) {
        context.previousTasksList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(getErrorMessage(err, 'Không thể di chuyển công việc.'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
