import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService
  ){}

  async signIn(email: string, password: string) {
    const user = await this.userService.findOne(email);
  }
}
