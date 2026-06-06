import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDictionaryDto } from './dto/createDictionary.dto';
import { UpdateDictionaryDto } from './dto/updateDictionary.dto';
import { DictionaryType, Prisma } from '@prisma/client';

@Injectable()
export class DictionariesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDictionaryDto) {
    try {
      return await this.prisma.dictionary.create({
        data: {
          type: dto.type,
          name: dto.name,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Такое значение уже есть в этом справочнике');
      }
      throw error;
    }
  }

  async findByType(type: DictionaryType) {
    return this.prisma.dictionary.findMany({
      where: { type, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findAll() {
    return this.prisma.dictionary.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async update(id: string, dto: UpdateDictionaryDto) {
    await this.ensureExists(id);
    return this.prisma.dictionary.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.dictionary.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.dictionary.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Запись справочника не найдена');
    }
  }
}