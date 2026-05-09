import { Injectable } from '@nestjs/common';
import bcrypt from 'node_modules/bcryptjs/umd/types';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: Repository<User>) { }

    async createUser(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        return user;
    }
}
