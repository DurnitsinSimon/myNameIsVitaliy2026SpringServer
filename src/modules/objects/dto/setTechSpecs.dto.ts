import { IsArray, IsString, IsNotEmpty, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TechSpecItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Название показателя обязательно' })
  label!: string;

  @IsString()
  @IsNotEmpty({ message: 'Значение обязательно' })
  value!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class SetTechSpecsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechSpecItemDto)
  items!: TechSpecItemDto[];
}