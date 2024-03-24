import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { FindOptions } from 'src/common/interfaces/repository';
import { getDeletedAtWhereClausule } from 'src/common/helpers/repository';
import { ResourceConflictException, UnauthorizedException } from 'src/common/exceptions/system';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userInput: CreateUserDto) {
    const existingUser = await this.findOne(userInput.email, {allowDeleted: true});

    // TODO: What to do when a previously deleted user try to create same account again? 
    if( existingUser && existingUser.deletedAt !== null )
      throw new UnauthorizedException("This account was previously deleted. Please contact site owner");
    else if (existingUser)
      throw new ResourceConflictException("An user with the given email already exists");

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

  async setRefreshToken(userId: number,refreshToken: string | null) {
    await this.userRepository.update( {id: userId}, { refreshToken });
  }

  toDto(user: User) {
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }
}
