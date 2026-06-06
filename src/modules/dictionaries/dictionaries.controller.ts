import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DictionariesService } from './dictionaries.service';
import { CreateDictionaryDto } from './dto/createDictionary.dto';
import { UpdateDictionaryDto } from './dto/updateDictionary.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { DictionaryType, UserRole } from '@prisma/client';

@Controller('dictionaries')
export class DictionariesController {
  constructor(private dictionariesService: DictionariesService) {}

  @Get()
  findByType(@Query('type') type?: DictionaryType) {
    if (type) {
      return this.dictionariesService.findByType(type);
    }
    return this.dictionariesService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDictionaryDto) {
    return this.dictionariesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDictionaryDto) {
    return this.dictionariesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dictionariesService.remove(id);
  }
}