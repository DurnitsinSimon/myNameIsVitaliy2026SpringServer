import { Injectable } from '@nestjs/common';
import PptxGenJS from 'pptxgenjs';
import { StorageService } from '../../media/storage.service';

interface ObjectWithMedia {
  title: string;
  city: string;
  objectType: string | null;
  client: string | null;
  area: number | null;
  floors: string | null;
  shortDescription: string;
  fullDescription: string | null;
  media: { url: string; type: string; useInPptx: boolean }[];
}

@Injectable()
export class PptxGenerator {
  constructor(private storage: StorageService) {}

  async generate(object: ObjectWithMedia): Promise<Buffer> {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    const title = pptx.addSlide();
    title.background = { color: '1B1B27' };
    title.addText(object.title, {
      x: 0.5, y: 2.0, w: 9.0, h: 1.0,
      fontSize: 40, bold: true, color: 'FFFFFF', align: 'center',
    });
    title.addText(object.city, {
      x: 0.5, y: 3.0, w: 9.0, h: 0.6,
      fontSize: 20, color: '4967E9', align: 'center',
    });

    const info = pptx.addSlide();
    info.addText('Описание проекта', {
      x: 0.5, y: 0.4, w: 9.0, h: 0.6, fontSize: 26, bold: true, color: '1B1B27',
    });
    info.addText(object.fullDescription || object.shortDescription, {
      x: 0.5, y: 1.2, w: 9.0, h: 2.0, fontSize: 14, color: '404155',
    });

    const specs: string[] = [];
    if (object.objectType) specs.push(`Тип: ${object.objectType}`);
    if (object.client) specs.push(`Заказчик: ${object.client}`);
    if (object.area) specs.push(`Площадь: ${object.area} м²`);
    if (object.floors) specs.push(`Этажность: ${object.floors}`);

    if (specs.length > 0) {
      info.addText(specs.join('\n'), {
        x: 0.5, y: 3.4, w: 9.0, h: 1.8, fontSize: 14, color: '1B1B27', bullet: true,
      });
    }

    const images = object.media.filter((m) => m.useInPptx);

    for (const img of images) {
      try {
        const buffer = await this.storage.downloadFile(img.url);
        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        const slide = pptx.addSlide();
        slide.addImage({
          data: base64,
          x: 0.5, y: 0.5, w: 9.0, h: 4.5,
          sizing: { type: 'contain', w: 9.0, h: 4.5 },
        });
      } catch {
        continue;
      }
    }

    const result = await pptx.write({ outputType: 'nodebuffer' });
    return result as Buffer;
  }
}