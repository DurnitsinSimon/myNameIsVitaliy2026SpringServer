import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { StorageService } from './storage.service';
import { UploadMediaDto } from './dto/uploadMedia.dto';
import { MediaType } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(file: Express.Multer.File, dto: UploadMediaDto) {
    const object = await this.prisma.object.findUnique({
      where: { id: dto.objectId },
    });
    if (!object) {
      throw new NotFoundException('Объект не найден');
    }

    if (dto.type === MediaType.MAIN_IMAGE) {
      await this.unsetPreviousMain(dto.objectId);
    }

    const { filename, url } = await this.storage.uploadFile(file);

    return this.prisma.media.create({
      data: {
        objectId: dto.objectId,
        type: dto.type,
        filename,
        url,
        altText: dto.altText,
        caption: dto.caption,
        sortOrder: dto.sortOrder ?? 0,
        useOnSite: dto.useOnSite ?? true,
        useInPptx: dto.useInPptx ?? false,
        useInPortfolio: dto.useInPortfolio ?? false,
      },
    });
  }

  async findByObject(objectId: string) {
    return this.prisma.media.findMany({
      where: { objectId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async delete(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Медиафайл не найден');
    }

    await this.storage.deleteFile(media.url);

    return this.prisma.media.delete({ where: { id } });
  }

  private async unsetPreviousMain(objectId: string) {
    await this.prisma.media.updateMany({
      where: { objectId, type: MediaType.MAIN_IMAGE },
      data: { type: MediaType.GALLERY },
    });
  }
}