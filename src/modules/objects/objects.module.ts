import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectsRepository } from './objects.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsRepository, PrismaService],
  exports: [ObjectsService],
})
export class ObjectsModule {}