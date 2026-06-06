import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwtAuth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import jwtConfig from './config/jwtConfig';
import { ObjectsModule } from './modules/objects/objects.module';
import minioConfig from './config/minioConfig';
import { MediaModule } from './modules/media/media.module';
import wordpressConfig from './config/wordpressConfig';
import { WordpressModule } from './modules/wordpress/wordpress.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, minioConfig, wordpressConfig],
    }),
    AuthModule,
    ObjectsModule,
    MediaModule,
    WordpressModule,
    ExportModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
