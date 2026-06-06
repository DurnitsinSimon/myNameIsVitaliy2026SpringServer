import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PptxGenerator } from './generators/pptx.generator';
import { DocxGenerator } from './generators/docx.generator';
import { PdfGenerator } from './generators/pdf.generator';
import { PrismaService } from '../../prisma.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [ExportController],
  providers: [ExportService, PptxGenerator, DocxGenerator, PdfGenerator, PrismaService],
})
export class ExportModule {}