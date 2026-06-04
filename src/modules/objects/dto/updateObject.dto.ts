import { PartialType } from '@nestjs/mapped-types';
import { CreateObjectDto } from './createObject.dto';

export class UpdateObjectDto extends PartialType(CreateObjectDto) {}