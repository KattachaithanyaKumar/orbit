import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsInt()
  position?: number;
}
