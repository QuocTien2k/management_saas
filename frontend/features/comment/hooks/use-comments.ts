import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/comment-service';
import { CreateCommentInput, UpdateCommentInput } from '../types/comment.types';

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getTaskComments(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => commentService.createComment(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentInput }) =>
      commentService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
