import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsInt()
  position?: number;
}
