import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class MoveTaskDto {
  @IsNotEmpty({ message: 'ID cột đích không được để trống' })
  @IsString()
  columnId: string;

  @IsNotEmpty({ message: 'Vị trí mới không được để trống' })
  @IsNumber()
  position: number;
}
