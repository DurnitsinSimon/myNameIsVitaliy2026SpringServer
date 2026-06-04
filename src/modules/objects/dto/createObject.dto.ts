import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateObjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(255, { message: 'Название максимум 255 символов' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortTitle?: string;

  @IsString()
  @IsNotEmpty({ message: 'Город обязателен' })
  city!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  designYear?: string;

  @IsOptional()
  @IsString()
  realizationYear?: string;

  @IsOptional()
  @IsString()
  projectStatus?: string;

  @IsOptional()
  @IsString()
  objectType?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  inpadRole?: string;

  @IsOptional()
  @IsString()
  designStage?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  area?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  siteArea?: number;

  @IsOptional()
  @IsString()
  floors?: string;

  @IsString()
  @IsNotEmpty({ message: 'Краткое описание обязательно' })
  @MinLength(10, { message: 'Краткое описание минимум 10 символов' })
  shortDescription!: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'SEO заголовок максимум 60 символов' })
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'SEO описание максимум 160 символов' })
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoSlug?: string;
}