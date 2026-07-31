'use client';

import * as React from 'react';
import { MessageSquareIcon, SendIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTaskComments, useCreateComment } from '../hooks/use-comments';
import { CommentItem } from './comment-item';

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const [newComment, setNewComment] = React.useState('');
  const { data: comments, isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment(taskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({ content: newComment.trim() });
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
        <MessageSquareIcon className="size-4 text-primary" />
        Bình luận ({comments?.length || 0})
      </div>

      {/* Form tạo comment */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Viết bình luận hoặc trao đổi thông tin..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-xs min-h-[70px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createComment.isPending}
            className="gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            {createComment.isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
            Gửi bình luận
          </Button>
        </div>
      </form>

      {/* Danh sách comment */}
      <div className="space-y-3 pt-2">
        {isLoading ? (
          <div className="flex justify-center py-4 text-xs text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin text-primary mr-2" /> Đang tải bình luận...
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} taskId={taskId} />
          ))
        ) : (
          <p className="text-center py-4 text-xs text-muted-foreground italic">
            Chưa có bình luận nào. Hãy bắt đầu thảo luận!
          </p>
        )}
      </div>
    </div>
  );
}
