import { Module } from '@nestjs/common';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DictionariesController],
  providers: [DictionariesService, PrismaService],
  exports: [DictionariesService],
})
export class DictionariesModule {}