import { IsString, IsOptional, IsUUID, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  subtitles?: {
    startTime: number;
    endTime: number;
    text: string;
  }[];
}
