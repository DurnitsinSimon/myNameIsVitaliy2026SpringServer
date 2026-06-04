import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaType } from '@prisma/client';

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty({ message: 'ID объекта обязателен' })
  objectId!: string;

  @IsEnum(MediaType, { message: 'Недопустимый тип медиафайла' })
  type!: MediaType;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useOnSite?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useInPptx?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  useInPortfolio?: boolean = false;
}