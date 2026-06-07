import { Injectable, Logger, NotFoundException, BadGatewayException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WordpressClient } from './wordpress.client';
import { ObjectStatus, WpPublishStatus, Object as ProjectObject } from '@prisma/client';
import { ObjectsService } from '../objects/objects.service';

@Injectable()
export class WordpressService {
  private readonly logger = new Logger(WordpressService.name);

  constructor(
    private prisma: PrismaService,
    private client: WordpressClient,
    private objectsService: ObjectsService
  ) {}

  async checkConnection() {
    try {
      return await this.client.checkConnection();
    } catch (error) {
      this.logger.error('Не удалось подключиться к WordPress', error);
      throw new BadGatewayException('Нет соединения с WordPress');
    }
  }

  async publish(objectId: string) {
    const object = await this.prisma.object.findUnique({
      where: { id: objectId },
      include: { media: true },
    });
    if (!object) {
      throw new NotFoundException('Объект не найден');
    }

    this.objectsService.validateForPublishing(object);

    const payload = this.buildPayload(object);

    try {
      let wpPost;

      if (object.wpPostId) {
        wpPost = await this.client.updatePost(object.wpPostId, payload);
      } else {
        wpPost = await this.client.createPost(payload);
      }

      return this.prisma.object.update({
        where: { id: objectId },
        data: {
          wpPostId: wpPost.id,
          wpPostUrl: wpPost.link,
          wpPublishStatus: object.wpPostId
            ? WpPublishStatus.UPDATED
            : WpPublishStatus.PUBLISHED,
          status: ObjectStatus.PUBLISHED,
        },
      });
    } catch (error) {
      this.logger.error(`Ошибка публикации объекта ${objectId}`, error);

      await this.prisma.object.update({
        where: { id: objectId },
        data: {
          wpPublishStatus: WpPublishStatus.PUBLISH_ERROR,
          status: ObjectStatus.PUBLISH_ERROR,
        },
      });

      throw new BadGatewayException('Не удалось опубликовать объект в WordPress');
    }
  }

  async unpublish(objectId: string) {
    const object = await this.prisma.object.findUnique({ where: { id: objectId } });
    if (!object) {
      throw new NotFoundException('Объект не найден');
    }
    if (!object.wpPostId) {
      throw new NotFoundException('Объект не был опубликован');
    }

    try {
      await this.client.updatePost(object.wpPostId, { status: 'draft' });

      return this.prisma.object.update({
        where: { id: objectId },
        data: { wpPublishStatus: WpPublishStatus.UNPUBLISHED },
      });
    } catch (error) {
      this.logger.error(`Ошибка снятия с публикации ${objectId}`, error);
      throw new BadGatewayException('Не удалось снять объект с публикации');
    }
  }

  private buildPayload(object: ProjectObject) {
    const content = [
      object.fullDescription || object.shortDescription,
      object.city ? `\n\nГород: ${object.city}` : '',
      object.area ? `\nПлощадь: ${object.area} м²` : '',
    ].join('');

    return {
      title: object.title,
      content,
      excerpt: object.shortDescription,
      status: 'publish' as const,
      slug: object.seoSlug || undefined,
    };
  }

}