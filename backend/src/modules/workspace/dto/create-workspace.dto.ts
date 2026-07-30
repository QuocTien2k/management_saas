import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên không gian làm việc không được để trống' })
  @MaxLength(100, {
    message: 'Tên không gian làm việc không được dài quá 100 ký tự',
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Slug không được dài quá 100 ký tự' })
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả không được dài quá 500 ký tự' })
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
