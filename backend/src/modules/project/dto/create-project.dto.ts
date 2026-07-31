import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Mã dự án không được để trống' })
  @IsString()
  @MaxLength(10, { message: 'Mã dự án tối đa 10 ký tự' })
  key: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Workspace ID không được để trống' })
  @IsString()
  workspaceId: string;
}
