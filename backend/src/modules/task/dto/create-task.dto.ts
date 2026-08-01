import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

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
