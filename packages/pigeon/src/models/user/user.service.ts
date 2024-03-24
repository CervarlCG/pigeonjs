import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteOptions, FindOptions } from 'src/common/interfaces/repository';
import { getDeletedAtWhereClausule } from 'src/common/helpers/repository';
import { ResourceConflictException, UnauthorizedException } from 'src/common/exceptions/system';
import * as bcrypt from "bcrypt";

/**
 * Service for managing user-related operations.
 */
@Injectable()
export class UserService {
  /**
   * Constructor for UserService.
   * @param userRepository - The repository for user entity.
   */
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user.
   * @param userInput - The user input DTO.
   * @throws UnauthorizedException - If the user was previously deleted.
   * @throws ResourceConflictException - If an user with the given email already exists.
   */
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

  /**
   * Finds one user by email.
   * @param email - The email of the user to find.
   * @param options - Options for finding the user.
   */
  async findOne( email: string, options: FindOptions = {} ) {
    return this.userRepository.findOne({where: {
      email, 
      ...getDeletedAtWhereClausule(options.allowDeleted)
    }});
  }

  /**
   * Deletes a user.
   * @param id - The id of the user to delete.
   * @param options - Options for deleting the user.
   */
  async delete( id: number, options: DeleteOptions = {} ) {
    if( options.hardDelete !== true )
      this.userRepository.update({ id }, { deletedAt: new Date() });
    else 
      this.userRepository.delete({id});
  }

  /**
   * Hashes a password.
   * @param password - The password to hash.
   */
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verifies a password against a hashed password.
   * @param hashedPassword - The hashed password.
   * @param plainPassword - The plain password to verify.
   */
  async verifyPassword(hashedPassword: string, plainPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Sets a refresh token for a user.
   * @param userId - The id of the user.
   * @param refreshToken - The refresh token to set.
   */
  async setRefreshToken(userId: number,refreshToken: string | null) {
    await this.userRepository.update( {id: userId}, { refreshToken });
  }

  /**
   * Converts a user entity to a user DTO.
   * @param user - The user entity to convert.
   */
  toDto(user: User) {
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }
}
