import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'ID cột không được để trống' })
  @IsString()
  columnId: string;

  @IsNotEmpty({ message: 'ID dự án không được để trống' })
  @IsString()
  projectId: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Định dạng ngày hết hạn không hợp lệ' })
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
