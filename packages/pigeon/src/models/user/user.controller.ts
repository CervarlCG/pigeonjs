import { Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ){}
  @Post("signup")
  async signUp(@Req() req: Request) {
    return this.userService.create(req.body);
  }
}
