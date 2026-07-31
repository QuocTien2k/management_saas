'use client';

import * as React from 'react';
import { Trash2Icon, Edit2Icon, CheckIcon, XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Comment } from '../types/comment.types';
import { useUpdateComment, useDeleteComment } from '../hooks/use-comments';

interface CommentItemProps {
  comment: Comment;
  taskId: string;
}

export function CommentItem({ comment, taskId }: CommentItemProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.id === comment.userId;

  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(comment.content);

  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const handleUpdate = async () => {
    if (!content.trim()) return;
    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: { content: content.trim() },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await deleteComment.mutateAsync(comment.id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const formattedTime = new Date(comment.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3 text-xs group">
      <Avatar className="size-7 text-xs border border-border/60 mt-0.5">
        <AvatarImage src={comment.user.avatar || undefined} alt={comment.user.fullname} />
        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
          {comment.user.fullname?.slice(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{comment.user.fullname}</span>
            <span className="text-[10px] text-muted-foreground">{formattedTime}</span>
          </div>

          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <Edit2Icon className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2 pt-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xs min-h-[60px]"
            />
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                onClick={handleUpdate}
                disabled={updateComment.isPending}
                className="gap-1 text-[11px] h-7 px-2.5"
              >
                <CheckIcon className="size-3" /> Lưu
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setContent(comment.content);
                  setIsEditing(false);
                }}
                className="gap-1 text-[11px] h-7 px-2.5"
              >
                <XIcon className="size-3" /> Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 p-2.5 text-foreground leading-relaxed whitespace-pre-wrap border border-border/40">
            {comment.content}
          </div>
        )}
      </div>
    </div>
  );
}
