import { IsArray, IsUUID } from 'class-validator';

export class SetCategoriesDto {
  @IsArray()
  @IsUUID('4', { each: true, message: 'Каждая категория должна быть валидным UUID' })
  categoryIds!: string[];
}