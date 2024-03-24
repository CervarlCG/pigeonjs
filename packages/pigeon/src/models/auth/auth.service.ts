import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from 'src/common/exceptions/system';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ){}

  async signIn(user: User) {
    const payload = {sub: user.id, email: user.email};
    return {
      accessToken: await this.jwtService.signAsync(payload)
    }
  }

  async signUp( userInput: CreateUserDto ) {
    const user = await this.userService.create(userInput);
    return this.userService.toDto(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);

    if( !user || !this.userService.verifyPassword(user.password, password) ) 
      return null;

    return this.userService.toDto(user);
  }
}
