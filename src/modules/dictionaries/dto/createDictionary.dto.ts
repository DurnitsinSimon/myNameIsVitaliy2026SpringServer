import { IsEnum, IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { DictionaryType } from '@prisma/client';

export class CreateDictionaryDto {
  @IsEnum(DictionaryType, { message: 'Недопустимый тип справочника' })
  type!: DictionaryType;

  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;
}