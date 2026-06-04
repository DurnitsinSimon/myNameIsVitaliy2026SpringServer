import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { WordpressService } from './wordpress.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('wordpress')
export class WordpressController {
  constructor(private wordpressService: WordpressService) {}

  @Get('check')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  checkConnection() {
    return this.wordpressService.checkConnection();
  }

  @Post('publish/:objectId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  publish(@Param('objectId', ParseUUIDPipe) objectId: string) {
    return this.wordpressService.publish(objectId);
  }

  @Post('unpublish/:objectId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  unpublish(@Param('objectId', ParseUUIDPipe) objectId: string) {
    return this.wordpressService.unpublish(objectId);
  }
}