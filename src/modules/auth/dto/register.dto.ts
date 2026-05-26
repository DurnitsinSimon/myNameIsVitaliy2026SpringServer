import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MinLength(2, { message: 'Имя минимум 2 символа' })
  name!: string;
}