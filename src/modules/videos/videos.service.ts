import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, SubtitleSegment, Vocabulary } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(SubtitleSegment)
    private subtitleRepository: Repository<SubtitleSegment>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async create(createVideoDto: CreateVideoDto, creator: User): Promise<Video> {
    const { categoryId, subtitles, ...videoData } = createVideoDto;
    
    const video = this.videoRepository.create({
      ...videoData,
      creator,
    });

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      video.category = category;
    }

    const savedVideo = await this.videoRepository.save(video);

    if (subtitles && subtitles.length > 0) {
      const subtitleEntities = subtitles.map(sub => 
        this.subtitleRepository.create({ ...sub, video: savedVideo })
      );
      await this.subtitleRepository.save(subtitleEntities);
    }

    return this.findOne(savedVideo.id);
  }

  async findAll(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { isDraft: false },
      relations: ['category', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(categoryName: string): Promise<Video[]> {
    return this.videoRepository.find({
      where: { 
        category: { name: categoryName },
        isDraft: false 
      },
      relations: ['category', 'creator'],
    });
  }

  async findDrafts(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { isDraft: true },
      relations: ['category', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['category', 'creator', 'subtitles'],
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async likeVideo(id: string, user: User): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { id }, relations: ['likedBy'] });
    if (!video) throw new NotFoundException('Video not found');

    const isLiked = video.likedBy.some(u => u.id === user.id);
    if (isLiked) {
      video.likedBy = video.likedBy.filter(u => u.id !== user.id);
      video.likesCount = Math.max(0, video.likesCount - 1);
    } else {
      video.likedBy.push(user);
      video.likesCount += 1;
    }
    await this.videoRepository.save(video);
  }

  async favoriteVideo(id: string, user: User): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { id }, relations: ['favoritedBy'] });
    if (!video) throw new NotFoundException('Video not found');

    const isFavorited = video.favoritedBy.some(u => u.id === user.id);
    if (isFavorited) {
      video.favoritedBy = video.favoritedBy.filter(u => u.id !== user.id);
      video.favoritesCount = Math.max(0, video.favoritesCount - 1);
    } else {
      video.favoritedBy.push(user);
      video.favoritesCount += 1;
    }
    await this.videoRepository.save(video);
  }

  async getLikedVideos(user: User): Promise<Video[]> {
    const fullUser = await this.userRepository.findOne({ where: { id: user.id }, relations: ['likedVideos', 'likedVideos.category'] });
    return fullUser?.likedVideos || [];
  }

  async getFavoriteVideos(user: User): Promise<Video[]> {
    const fullUser = await this.userRepository.findOne({ where: { id: user.id }, relations: ['favoriteVideos', 'favoriteVideos.category'] });
    return fullUser?.favoriteVideos || [];
  }

  async learnWord(userId: string, vocabularyId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['learnedWords'] });
    const word = await this.vocabularyRepository.findOne({ where: { id: vocabularyId } });
    
    if (!user || !word) throw new NotFoundException('User or word not found');
    
    if (!user.learnedWords.some(w => w.id === word.id)) {
      user.learnedWords.push(word);
      await this.userRepository.save(user);
    }
  }

  async getLearnedWords(userId: string): Promise<Vocabulary[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['learnedWords'] });
    return user?.learnedWords || [];
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id);
    
    if (updateVideoDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateVideoDto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      video.category = category;
    }

    const { categoryId, ...updateData } = updateVideoDto;
    Object.assign(video, updateData);
    
    return this.videoRepository.save(video);
  }

  async getDashboardStats() {
    console.log('Service: Fetching dashboard stats...');
    try {
      const totalVideos = await this.videoRepository.count({ where: { isDraft: false } });
      const totalDrafts = await this.videoRepository.count({ where: { isDraft: true } });
      
      const videos = await this.videoRepository.find();
      const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
      
      const totalUsers = await this.userRepository.count();
      console.log(`Service: Stats fetched - Videos: ${totalVideos}, Drafts: ${totalDrafts}, Users: ${totalUsers}`);

      const chartData = [
        { month: "Jan", views: 1200 },
        { month: "Feb", views: 2100 },
        { month: "Mar", views: 1800 },
        { month: "Apr", views: 3400 },
        { month: "May", views: 3100 },
        { month: "Jun", views: 4200 },
        { month: "Jul", views: 5100 },
      ];

      return {
        totalViews,
        totalVideos,
        totalDrafts,
        totalUsers,
        chartData,
      };
    } catch (error) {
      console.error('Service: Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);
    await this.videoRepository.remove(video);
  }
}
