import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}
