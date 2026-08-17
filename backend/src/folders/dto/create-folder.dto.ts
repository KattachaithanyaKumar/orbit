import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  position?: number;
}
