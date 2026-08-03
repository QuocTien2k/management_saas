'use client';

import * as React from 'react';
import { ShieldCheckIcon, ShieldIcon, UserIcon, MoreHorizontalIcon, Trash2Icon, LogOutIcon } from 'lucide-react';
import { WorkspaceMember, WorkspaceRole } from '../types/workspace';
import { useUpdateMemberRole, useRemoveMember } from '../hooks/use-members';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface MemberListTableProps {
  workspaceId: string;
  members: WorkspaceMember[];
  currentUserId?: string;
  currentUserRole?: WorkspaceRole;
}

export function MemberListTable({
  workspaceId,
  members,
  currentUserId,
  currentUserRole = 'MEMBER',
}: MemberListTableProps) {
  const updateRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);

  const [memberToRemove, setMemberToRemove] = React.useState<{ id: string; name: string } | null>(null);

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN' || isOwner;

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      await updateRoleMutation.mutateAsync({ memberId, role: newRole });
      toast.success('Đã cập nhật vai trò thành viên thành công');
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(getErrorMessage(error, 'Không thể cập nhật vai trò thành viên.'));
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.id);
      toast.success('Thao tác xóa thành viên thành công');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(getErrorMessage(error, 'Không thể thực hiện thao tác xóa thành viên.'));
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName });
  };

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <Badge variant="warning" className="gap-1">
            <ShieldCheckIcon className="size-3" /> Owner
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge variant="info" className="gap-1">
            <ShieldIcon className="size-3" /> Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <UserIcon className="size-3" /> Member
          </Badge>
        );
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thành viên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Ngày tham gia</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isMemberOwner = member.role === 'OWNER';

          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    {member.user.avatar && (
                      <AvatarImage src={member.user.avatar} alt={member.user.fullname || member.user.email} />
                    )}
                    <AvatarFallback>
                      {(member.user.fullname || member.user.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {member.user.fullname || 'Người dùng'} {isSelf && '(Bạn)'}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.user.email}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground text-xs">
                {member.user.email}
              </TableCell>

              <TableCell>
                {isOwner && !isSelf && !isMemberOwner ? (
                  <Select
                    value={member.role}
                    onValueChange={(val) => {
                      if (val) handleRoleChange(member.id, val as WorkspaceRole);
                    }}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getRoleBadge(member.role)
                )}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
              </TableCell>

              <TableCell className="text-right">
                {(isAdmin && !isMemberOwner && !isSelf) || isSelf ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      {isSelf ? (
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.id, member.user?.fullname || member.user?.email || 'thành viên')}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <LogOutIcon className="size-4 mr-2" />
                          Rời khỏi Workspace
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.id, member.user?.fullname || member.user?.email || 'thành viên')}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2Icon className="size-4 mr-2" />
                          Xóa khỏi Workspace
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    <ConfirmDialog
      open={Boolean(memberToRemove)}
      onOpenChange={(open) => !open && setMemberToRemove(null)}
      title="Xác nhận xóa thành viên"
      description={`Bạn có chắc chắn muốn xóa thành viên "${memberToRemove?.name}" khỏi không gian làm việc này?`}
      confirmText="Xóa thành viên"
      cancelText="Hủy bỏ"
      variant="destructive"
      isLoading={removeMemberMutation.isPending}
      onConfirm={confirmRemoveMember}
    />
    </>
  );
}
