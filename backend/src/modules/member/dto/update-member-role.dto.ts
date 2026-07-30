import { IsEnum, IsNotEmpty } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceRole, {
    message: 'Vai trò trong không gian làm việc không hợp lệ',
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  role: WorkspaceRole;
}
