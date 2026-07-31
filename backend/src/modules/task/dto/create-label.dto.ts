import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateLabelDto {
  @IsNotEmpty({ message: 'Tên nhãn không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Mã màu không được để trống' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Mã màu phải ở định dạng Hex (ví dụ: #EF4444)' })
  color: string;
}
