import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class InviteMemberDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsEnum(WorkspaceRole, {
    message: 'Vai trò trong không gian làm việc không hợp lệ',
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  role: WorkspaceRole;
}
