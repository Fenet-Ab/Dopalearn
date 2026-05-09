import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/modules/users/users.service';
import { Role } from './src/modules/auth/roles.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = 'betsi@gmail.com';
  console.log(`Searching for user with email: ${email}...`);
  
  const user = await usersService.findByEmail(email);
  
  if (user) {
    console.log(`User found. Current role: ${user.role}. Updating to ${Role.ADMIN}...`);
    await usersService.update(user.id, { role: Role.ADMIN } as any);
    console.log('Success! User is now an admin.');
  } else {
    console.log('User not found. Please make sure you registered with betsi@gmail.com');
  }

  await app.close();
}

bootstrap();
