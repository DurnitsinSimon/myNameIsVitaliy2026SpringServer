import { PartialType } from '@nestjs/mapped-types';
import { CreateDictionaryDto } from './createDictionary.dto';

export class UpdateDictionaryDto extends PartialType(CreateDictionaryDto) {}