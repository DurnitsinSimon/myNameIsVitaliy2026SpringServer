import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}