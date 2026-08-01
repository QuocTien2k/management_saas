'use client';

import * as React from 'react';
import { SearchIcon, FilterIcon, XIcon, UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberOption, TaskFilters, TaskPriority, TaskStatus } from '../../types/task.types';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  members?: MemberOption[];
}

export function TaskFiltersBar({ filters, onFilterChange, members }: TaskFiltersProps) {
  const selectedMember = React.useMemo(() => {
    if (!members || !filters.assigneeId || filters.assigneeId === 'ALL') return null;
    return members.find((m) => m.id === filters.assigneeId);
  }, [members, filters.assigneeId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handlePriorityChange = (val: string) => {
    onFilterChange({
      ...filters,
      priority: val === 'ALL' ? undefined : (val as TaskPriority),
    });
  };

  const handleAssigneeChange = (val: string) => {
    onFilterChange({
      ...filters,
      assigneeId: val === 'ALL' ? undefined : val,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Boolean(filters.search || filters.priority || filters.assigneeId);

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between py-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative min-w-50 flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'ALL'}
          onValueChange={(val) => handlePriorityChange(val as string)}
        >
          <SelectTrigger className="h-8 text-xs w-32.5 bg-background">
            <SelectValue placeholder="Độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả ưu tiên</SelectItem>
            <SelectItem value="URGENT">Khẩn cấp</SelectItem>
            <SelectItem value="HIGH">Cao</SelectItem>
            <SelectItem value="MEDIUM">Trung bình</SelectItem>
            <SelectItem value="LOW">Thấp</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        {members && members.length > 0 && (
          <Select
            value={filters.assigneeId || 'ALL'}
            onValueChange={(val) => handleAssigneeChange(val as string)}
          >
            <SelectTrigger className="h-8 text-xs w-37.5 bg-background">
              <SelectValue placeholder="Người thực hiện">
                {selectedMember ? (
                  <div className="flex items-center gap-1.5 truncate">
                    <Avatar className="size-4 shrink-0">
                      <AvatarImage src={selectedMember.avatar || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {selectedMember.fullname?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{selectedMember.fullname}</span>
                  </div>
                ) : (
                  !filters.assigneeId || filters.assigneeId === 'ALL' ? 'Tất cả người thực hiện' : undefined
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả người thực hiện</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-4 shrink-0">
                      <AvatarImage src={m.avatar || undefined} />
                      <AvatarFallback className="text-[8px]">{m.fullname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{m.fullname}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearFilters}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <XIcon className="size-3.5" /> Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
