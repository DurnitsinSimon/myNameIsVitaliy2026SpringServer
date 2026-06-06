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
}
