import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from 'src/common/exceptions';
import { JwtService } from '@nestjs/jwt';

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
}
