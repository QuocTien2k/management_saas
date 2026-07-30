import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @IsString({ message: 'Token mời phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Token lời mời không được để trống' })
  token: string;
}
