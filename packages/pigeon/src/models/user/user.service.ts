import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Not, Repository, Any } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from "bcrypt";
import { FindOptions } from 'src/common/interfaces/repository';
import { getDeletedAtWhereClausule } from 'src/common/helpers/repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userInput: CreateUserDto) {
    const user = this.userRepository.create({...userInput, password: await this.hashPassword(userInput.password)})
    return await this.userRepository.save(user);
  }

  async findOne( email: string, options: FindOptions = {} ) {
    return this.userRepository.findOne({where: {
      email, 
      ...getDeletedAtWhereClausule(options.allowDeleted)
    }});
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(hashedPassword: string, plainPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async toDto(user: User) {
    const { password, createdAt, updatedAt, deletedAt, ...userDto } = user;
    return userDto;
  }
}
