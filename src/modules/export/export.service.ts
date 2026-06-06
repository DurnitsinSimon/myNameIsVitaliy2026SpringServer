import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PptxGenerator } from './generators/pptx.generator';
import { DocxGenerator } from './generators/docx.generator';
import { PdfGenerator } from './generators/pdf.generator';

export type ExportFormat = 'pptx' | 'docx' | 'pdf';

interface ExportResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private pptxGenerator: PptxGenerator,
    private docxGenerator: DocxGenerator,
    private pdfGenerator: PdfGenerator,
  ) {}

  async export(objectId: string, format: ExportFormat): Promise<ExportResult> {
    const object = await this.prisma.object.findUnique({
      where: { id: objectId },
      include: { media: true },
    });

    if (!object) {
      throw new NotFoundException('Объект не найден');
    }

    const safeName = object.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_').slice(0, 50);

    switch (format) {
      case 'pptx': {
        const buffer = await this.pptxGenerator.generate(object);
        return {
          buffer,
          filename: `${safeName}.pptx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
      }
      case 'docx': {
        const buffer = await this.docxGenerator.generate(object);
        return {
          buffer,
          filename: `${safeName}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
      }
      case 'pdf': {
        const buffer = await this.pdfGenerator.generate(object);
        return {
          buffer,
          filename: `${safeName}.pdf`,
          mimeType: 'application/pdf',
        };
      }
    }
  }
}