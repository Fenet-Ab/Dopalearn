import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Video, Vocabulary } from '../../videos/entities/video.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column({ select: false }) // Hide password by default in queries
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Video, (video) => video.creator)
  createdVideos: Video[];

  @ManyToMany(() => Video, (video) => video.likedBy)
  likedVideos: Video[];

  @ManyToMany(() => Video, (video) => video.favoritedBy)
  favoriteVideos: Video[];

  @ManyToMany(() => Vocabulary)
  @JoinTable({ name: 'user_learned_vocabulary' })
  learnedWords: Vocabulary[];
}
