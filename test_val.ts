import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateVideoDto } from './src/modules/videos/dto/create-video.dto';

async function run() {
  const payload = {
    title: 'Test',
    description: '',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    isDraft: 'true'
  };

  const dto = plainToInstance(CreateVideoDto, payload, { enableImplicitConversion: true });
  console.log('Transformed:', dto);
  const errors = await validate(dto, { forbidNonWhitelisted: true, whitelist: true });
  console.log('Errors:', JSON.stringify(errors, null, 2));
}
run();
