import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as exportService_1 from './export.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('export')
export class ExportController {
  constructor(private exportService: exportService_1.ExportService) {}

  @Get(':objectId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  async export(
    @Param('objectId', ParseUUIDPipe) objectId: string,
    @Query('format') format: exportService_1.ExportFormat,
    @Res() res: Response,
  ) {
    const allowed: exportService_1.ExportFormat[] = ['pptx', 'docx', 'pdf'];
    if (!allowed.includes(format)) {
      throw new BadRequestException('Допустимые форматы: pptx, docx, pdf');
    }

    const result = await this.exportService.export(objectId, format);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(result.filename)}`,
    );
    res.send(result.buffer);
  }
}