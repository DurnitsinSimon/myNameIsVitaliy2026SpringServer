import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { join } from 'path';

interface ObjectData {
  title: string;
  city: string;
  objectType: string | null;
  client: string | null;
  area: number | null;
  floors: string | null;
  designYear: string | null;
  shortDescription: string;
  fullDescription: string | null;
}

@Injectable()
export class PdfGenerator {
  private readonly fontPath = join(__dirname, 'assets', 'DejaVuSans.ttf');
  
  async generate(object: ObjectData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.registerFont('DejaVu', this.fontPath);
      doc.font('DejaVu');

      doc.fontSize(24).fillColor('#1B1B27').text(object.title);
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#4967E9').text(object.city);
      doc.moveDown(1);

      doc.fontSize(16).fillColor('#1B1B27').text('Описание');
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#404155').text(object.fullDescription || object.shortDescription);
      doc.moveDown(1);

      doc.fontSize(16).fillColor('#1B1B27').text('Характеристики');
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#404155');

      if (object.objectType) doc.text(`Тип: ${object.objectType}`);
      if (object.client) doc.text(`Заказчик: ${object.client}`);
      if (object.area) doc.text(`Площадь: ${object.area} м²`);
      if (object.floors) doc.text(`Этажность: ${object.floors}`);
      if (object.designYear) doc.text(`Год проектирования: ${object.designYear}`);

      doc.end();
    });
  }
}