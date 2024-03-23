import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResourceNotFoundException, UnauthorizedException } from 'src/common/exceptions';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService
  ){}

  async signIn(email: string, password: string) {
    const user = await this.userService.findOne(email);

    // Prevent tell "client" what failed for security reasons
    if( !user || !this.userService.verifyPassword(user.password, password) ) 
      throw new UnauthorizedException("Authentication failed. Please check your login details and try again.");

    return this.userService.toDto(user);
  }
}
