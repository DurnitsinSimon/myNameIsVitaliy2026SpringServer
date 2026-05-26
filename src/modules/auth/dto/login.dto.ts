import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;
}