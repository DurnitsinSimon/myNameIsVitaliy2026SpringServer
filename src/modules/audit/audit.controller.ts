import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

class AuditQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 50;
}

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query.page, query.limit);
  }

  @Get('object/:objectId')
  @Roles(UserRole.ADMIN)
  findByObject(@Param('objectId', ParseUUIDPipe) objectId: string) {
    return this.auditService.findByObject(objectId);
  }
}