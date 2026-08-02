'use client';

import * as React from 'react';
import { AtSignIcon, SendIcon, Loader2Icon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-members';

interface MentionInputProps {
  workspaceId?: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
}

export function MentionInput({
  workspaceId,
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
  placeholder = 'Viết bình luận hoặc nhập @ để nhắc tên thành viên...',
}: MentionInputProps) {
  const { data: members } = useWorkspaceMembers(workspaceId || null);
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionFilter, setMentionFilter] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const filteredMembers = React.useMemo(() => {
    if (!members) return [];
    if (!mentionFilter) return members;
    return members.filter(
      (m) =>
        m.user?.fullname?.toLowerCase().includes(mentionFilter.toLowerCase()) ||
        m.user?.email.toLowerCase().includes(mentionFilter.toLowerCase())
    );
  }, [members, mentionFilter]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionFilter(query);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleSelectMember = (fullname: string) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = value.slice(cursorPos);

    const newValue = `${value.slice(0, lastAtIndex)}@${fullname} ${textAfterCursor}`;
    onChange(newValue);
    setShowMentions(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  return (
    <div className="space-y-2 relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={3}
          className="text-xs min-h-18.75 resize-none pr-8"
        />

        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute z-50 bottom-full mb-1 left-0 w-64 max-h-48 overflow-y-auto bg-popover border border-border/80 rounded-xl shadow-lg p-1.5 space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 flex items-center gap-1 border-b border-border/50">
              <AtSignIcon className="size-3 text-primary" /> Đề cập thành viên
            </div>
            {filteredMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMember(m.user.fullname || m.user.email)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/80 text-left transition-colors cursor-pointer"
              >
                <Avatar className="size-5 shrink-0 border border-border/60">
                  <AvatarImage src={m.user.avatar || undefined} />
                  <AvatarFallback className="text-[8px]">
                    {(m.user.fullname || m.user.email).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {m.user.fullname || 'Thành viên'}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{m.user.email}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <AtSignIcon className="size-3" /> Gõ @ để nhắc tên thành viên trong dự án
        </span>

        <Button
          type="button"
          size="sm"
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting}
          className="gap-1.5 text-xs shadow-xs cursor-pointer h-8 px-3"
        >
          {isSubmitting ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <SendIcon className="size-3.5" />
          )}
          Gửi bình luận
        </Button>
      </div>
    </div>
  );
}
