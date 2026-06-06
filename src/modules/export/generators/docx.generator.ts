import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';

interface ObjectData {
  title: string;
  city: string;
  address: string | null;
  objectType: string | null;
  client: string | null;
  area: number | null;
  siteArea: number | null;
  floors: string | null;
  designYear: string | null;
  realizationYear: string | null;
  shortDescription: string;
  fullDescription: string | null;
}

@Injectable()
export class DocxGenerator {
  async generate(object: ObjectData): Promise<Buffer> {
    const specs: { label: string; value: string }[] = [];

    if (object.objectType) specs.push({ label: 'Тип объекта', value: object.objectType });
    if (object.client) specs.push({ label: 'Заказчик', value: object.client });
    if (object.address) specs.push({ label: 'Адрес', value: object.address });
    if (object.area) specs.push({ label: 'Площадь', value: `${object.area} м²` });
    if (object.siteArea) specs.push({ label: 'Площадь участка', value: `${object.siteArea} м²` });
    if (object.floors) specs.push({ label: 'Этажность', value: object.floors });
    if (object.designYear) specs.push({ label: 'Год проектирования', value: object.designYear });
    if (object.realizationYear) specs.push({ label: 'Год реализации', value: object.realizationYear });

    const specRows = specs.map(
      (s) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: s.label, bold: true })] })],
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph(s.value)],
            }),
          ],
        }),
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: object.title, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({
              children: [new TextRun({ text: object.city, color: '4967E9', size: 28 })],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Описание', heading: HeadingLevel.HEADING_2 }),
            new Paragraph(object.fullDescription || object.shortDescription),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Характеристики', heading: HeadingLevel.HEADING_2 }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: specRows,
            }),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc);
  }
}