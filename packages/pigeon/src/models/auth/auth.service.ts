import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from 'src/common/exceptions/server';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ){}

  async signIn(email: string, password: string) {
    const user = await this.userService.findOne(email);

    // Prevent tell "client" what failed for security reasons
    if( !user || !this.userService.verifyPassword(user.password, password) ) 
      throw new UnauthorizedException("Authentication failed. Please check your login details and try again.");

    const payload = {sub: user.id, email: user.email};

    return {
      accessToken: await this.jwtService.signAsync(payload)
    }
  }

  async signUp( userInput: CreateUserDto ) {
    const user = await this.userService.create(userInput);
    return this.userService.toDto(user);
  }
}
