import { ObjectStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';


export class UpdateStatusDto {
  @IsEnum(ObjectStatus, { message: 'Недопустимый статус' })
  status!: ObjectStatus;
}
 