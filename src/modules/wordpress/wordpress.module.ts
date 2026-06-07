import { Module } from '@nestjs/common';
import { WordpressController } from './wordpress.controller';
import { WordpressService } from './wordpress.service';
import { WordpressClient } from './wordpress.client';
import { PrismaService } from '../../prisma.service';
import { ObjectsModule } from '../objects/objects.module';

@Module({
  imports: [ObjectsModule],
  controllers: [WordpressController],
  providers: [WordpressService, WordpressClient, PrismaService],
  exports: [WordpressService],
})
export class WordpressModule {}
