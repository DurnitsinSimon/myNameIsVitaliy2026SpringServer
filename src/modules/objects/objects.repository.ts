import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateObjectDto } from './dto/createObject.dto';
import { UpdateObjectDto } from './dto/updateObject.dto';
import { QueryObjectDto } from './dto/queryObject.dto';
import { ObjectStatus, Prisma } from '@prisma/client';

@Injectable()
export class ObjectsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateObjectDto, authorId: string) {
    return this.prisma.object.create({
      data: {
        ...dto,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: true,
        categories: { include: { category: true } },
      },
    });
  }

  async findAll(query: QueryObjectDto) {
    const { search, status, city, objectType, authorId, designYear, page = 1, limit = 20 } = query;

    const where: Prisma.ObjectWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (objectType) where.objectType = objectType;
    if (authorId) where.authorId = authorId;
    if (designYear) where.designYear = designYear;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.object.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, email: true } },
          media: { where: { type: 'MAIN_IMAGE' }, take: 1 },
          categories: { include: { category: true } },
        },
      }),
      this.prisma.object.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.prisma.object.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } },
        teamMembers: { orderBy: { sortOrder: 'asc' } },
        techSpecs: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async update(id: string, dto: UpdateObjectDto) {
    return this.prisma.object.update({
      where: { id },
      data: dto,
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: true,
        categories: { include: { category: true } },
      },
    });
  }

  async updateStatus(id: string, status: ObjectStatus) {
    return this.prisma.object.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.object.delete({ where: { id } });
  }

  async setCategories(objectId: string, categoryIds: string[]) {
    return this.prisma.$transaction([
      this.prisma.objectCategory.deleteMany({ where: { objectId } }),
      this.prisma.objectCategory.createMany({
        data: categoryIds.map((categoryId) => ({ objectId, categoryId })),
      }),
    ]);
  }

  async findByIdForPublishing(id: string) {
    return this.prisma.object.findUnique({
      where: { id },
      include: { media: true, categories: true },
    });
  }

  async setTechSpecs(
    objectId: string,
    items: { label: string; value: string; unit?: string; sortOrder?: number }[],
  ) {
    return this.prisma.$transaction([
      this.prisma.techSpec.deleteMany({ where: { objectId } }),
      this.prisma.techSpec.createMany({
        data: items.map((item, index) => ({
          objectId,
          label: item.label,
          value: item.value,
          unit: item.unit,
          sortOrder: item.sortOrder ?? index,
        })),
      }),
    ]);
  }

  async setTeamMembers(
    objectId: string,
    items: { role: string; name: string; sortOrder?: number }[],
  ) {
    return this.prisma.$transaction([
      this.prisma.teamMember.deleteMany({ where: { objectId } }),
      this.prisma.teamMember.createMany({
        data: items.map((item, index) => ({
          objectId,
          role: item.role,
          name: item.name,
          sortOrder: item.sortOrder ?? index,
        })),
      }),
    ]);
  }
}