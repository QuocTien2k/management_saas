import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class MoveTaskDto {
  @IsOptional()
  @IsString()
  columnId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsNotEmpty({ message: 'Vị trí mới không được để trống' })
  @IsNumber()
  position: number;
}
