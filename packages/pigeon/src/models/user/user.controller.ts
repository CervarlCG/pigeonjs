import { Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { QueryFailedError } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ){}
  @Post("signup")
  async signUp(@Req() req: Request) {
    try {
      let  x = await this.userService.create(req.body);
    }
    catch(err) {
      console.log("Error happened", err, err.toString(), err.stack)
    }
  }
}
