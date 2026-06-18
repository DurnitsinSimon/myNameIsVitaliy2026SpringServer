import { IsString, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя минимум 2 символа' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Недопустимая роль' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}