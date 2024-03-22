import { Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { ParametersException } from 'src/common/exceptions';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ){}
  @Post("signup")
  async signUp(@Req() req: Request) {
    throw new Error("API Error on param1")
    try {
      let  x = await this.userService.create(req.body);
    }
    catch(err) {
      console.log("Error happened")
      throw new Error("XD")
    }
  }
}

