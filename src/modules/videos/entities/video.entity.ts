import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: false })
  isDraft: boolean;

  @ManyToOne(() => User, (user) => user.createdVideos)
  creator: User;

  @ManyToOne(() => Category, (category) => category.videos)
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.likedVideos)
  @JoinTable({ name: 'video_likes' })
  likedBy: User[];

  @ManyToMany(() => User, (user) => user.favoriteVideos)
  @JoinTable({ name: 'video_favorites' })
  favoritedBy: User[];

  @OneToMany(() => SubtitleSegment, (subtitle) => subtitle.video, { cascade: true })
  subtitles: SubtitleSegment[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  favoritesCount: number;

  @Column({ default: 0 })
  viewsCount: number;
}

@Entity('subtitle_segments')
export class SubtitleSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  startTime: number;

  @Column('float')
  endTime: number;

  @Column('text')
  text: string;

  @ManyToOne(() => Video, (video) => video.subtitles)
  video: Video;
}

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column({ nullable: true })
  meaning: string;

  @Column({ nullable: true })
  context: string;
}
