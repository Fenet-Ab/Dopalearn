import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');
    
    if (!url || !key) {
      throw new Error('Supabase URL or Key is missing in environment variables');
    }
    
    this.supabase = createClient(url, key);
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${folder}/${fileName}`;
    const bucket = this.configService.get<string>('SUPABASE_BUCKET');

    if (!bucket) {
      throw new Error('Supabase bucket is not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}
