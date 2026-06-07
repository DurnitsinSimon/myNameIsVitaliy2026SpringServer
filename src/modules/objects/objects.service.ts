import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ObjectsRepository } from './objects.repository';
import { CreateObjectDto } from './dto/createObject.dto';
import { UpdateObjectDto } from './dto/updateObject.dto';
import { QueryObjectDto } from './dto/queryObject.dto';
import { ObjectStatus, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ObjectsService {
  constructor(
    private repository: ObjectsRepository,
    private audit: AuditService,
  ) {}

  async create(dto: CreateObjectDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  async findAll(query: QueryObjectDto) {
    return this.repository.findAll(query);
  }

  async findById(id: string) {
    const object = await this.repository.findById(id);
    if (!object) {
      throw new NotFoundException('Объект не найден');
    }
    return object;
  }

  async update(id: string, dto: UpdateObjectDto, userId: string, userRole: UserRole) {
    const object = await this.findById(id);

    if (userRole === UserRole.EDITOR && object.authorId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои объекты');
    }

    return this.repository.update(id, dto);
  }

  async updateStatus(id: string, status: ObjectStatus, userId: string, userRole: UserRole) {
    const object = await this.findById(id);

    if (userRole === UserRole.EDITOR && object.authorId !== userId) {
      throw new ForbiddenException('Недостаточно прав для изменения статуса');
    }

    if (status === ObjectStatus.PUBLISHED) {
      this.validateForPublishing(object);
    }

    const updated = await this.repository.updateStatus(id, status);
    await this.audit.log({
      userId,
      action: 'OBJECT_STATUS_CHANGED',
      objectId: id,
      details: { status },
    });
    return updated;
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const object = await this.findById(id);

    if (userRole !== UserRole.ADMIN && object.authorId !== userId) {
      throw new ForbiddenException('Удалять объект может только администратор или его автор');
    }

    await this.audit.log({
      userId,
      action: 'OBJECT_DELETED',
      details: { title: object.title, objectId: id },
    });
    return this.repository.delete(id);
  }

  validateForPublishing(object: {
    title: string;
    city: string;
    shortDescription: string;
    seoTitle: string | null;
    seoDescription: string | null;
    seoSlug: string | null;
    media: { type: string }[];
  }) {
    const errors: string[] = [];

    if (!object.title) errors.push('Отсутствует название');
    if (!object.city) errors.push('Отсутствует город');
    if (!object.shortDescription) errors.push('Отсутствует краткое описание');
    if (!object.seoTitle) errors.push('Отсутствует SEO заголовок');
    if (!object.seoDescription) errors.push('Отсутствует SEO описание');
    if (!object.seoSlug) errors.push('Отсутствует SEO slug');

    const hasMainImage = object.media?.some((m) => m.type === 'MAIN_IMAGE');
    if (!hasMainImage) errors.push('Отсутствует главное изображение');

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Объект не готов к публикации',
        errors,
      });
    }
  }
}