import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('stats/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  getDashboardStats() {
    console.log('Dashboard stats request received');
    return this.videosService.getDashboardStats();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new video (Admin only)' })
  create(@Body() createVideoDto: CreateVideoDto, @Req() req) {
    return this.videosService.create(createVideoDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos or filter by category' })
  @ApiQuery({ name: 'category', required: false, example: 'language' })
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.videosService.findByCategory(category);
    }
    return this.videosService.findAll();
  }

  @Get('drafts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all drafted videos (Admin only)' })
  getDrafts() {
    return this.videosService.findDrafts();
  }

  @Get('user/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLikedVideos(@Req() req) {
    return this.videosService.getLikedVideos(req.user);
  }

  @Get('user/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFavoriteVideos(@Req() req) {
    return this.videosService.getFavoriteVideos(req.user);
  }

  @Get('user/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLearnedWords(@Req() req) {
    return this.videosService.getLearnedWords(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video details by ID' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a video (Admin only)' })
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log(`Delete request received for video ID: ${id}`);
    return this.videosService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  likeVideo(@Param('id') id: string, @Req() req) {
    return this.videosService.likeVideo(id, req.user);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  favoriteVideo(@Param('id') id: string, @Req() req) {
    return this.videosService.favoriteVideo(id, req.user);
  }

  @Post('vocabulary/:id/learn')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  learnWord(@Param('id') id: string, @Req() req) {
    return this.videosService.learnWord(req.user.id, id);
  }
}
