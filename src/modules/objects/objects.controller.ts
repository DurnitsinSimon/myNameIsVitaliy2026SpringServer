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
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/createObject.dto';
import { UpdateObjectDto } from './dto/updateObject.dto';
import { QueryObjectDto } from './dto/queryObject.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import * as client from '@prisma/client';
import { UpdateStatusDto } from './dto/updateStatusObject.dto';
import { Audit } from '../../common/decorators/audit.decorator';
import { SetCategoriesDto } from './dto/setCategories.dto';
import { ApiOperation } from '@nestjs/swagger';
import { SetTechSpecsDto } from './dto/setTechSpecs.dto';
import { SetTeamMembersDto } from './dto/setTeamMembers.dto';


@Controller('objects')
export class ObjectsController {
  constructor(private objectsService: ObjectsService) {}

  @Post()
  @Roles(client.UserRole.ADMIN, client.UserRole.EDITOR)
  @Audit('OBJECT_CREATED')
  create(@Body() dto: CreateObjectDto, @CurrentUser() user: client.User) {
    return this.objectsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: QueryObjectDto) {
    return this.objectsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.objectsService.findById(id);
  }

  @Patch(':id')
  @Roles(client.UserRole.ADMIN, client.UserRole.EDITOR)
  @Audit('OBJECT_UPDATED')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateObjectDto,
    @CurrentUser() user: client.User,
  ) {
    return this.objectsService.update(id, dto, user.id, user.role);
  }

  @Patch(':id/status')
  @Roles(client.UserRole.ADMIN, client.UserRole.EDITOR)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: client.User,
  ) {
    return this.objectsService.updateStatus(id, dto.status, user.id, user.role);
  }

  @Delete(':id')
  @Roles(client.UserRole.ADMIN, client.UserRole.EDITOR)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: client.User,
  ) {
    return this.objectsService.delete(id, user.id, user.role);
  }

  @ApiOperation({ summary: 'Установить категории объекта' })
  @Patch(':id/categories')
  setCategories(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCategoriesDto,
  ) {
    return this.objectsService.setCategories(id, dto.categoryIds);
  }

  @ApiOperation({ summary: 'Установить технико-экономические показатели объекта' })
  @Patch(':id/tech-specs')
  setTechSpecs(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetTechSpecsDto,
  ) {
    return this.objectsService.setTechSpecs(id, dto.items);
  }

  @ApiOperation({ summary: 'Установить команду проекта' })
  @Patch(':id/team')
  setTeamMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetTeamMembersDto,
  ) {
    return this.objectsService.setTeamMembers(id, dto.items);
  }
}
