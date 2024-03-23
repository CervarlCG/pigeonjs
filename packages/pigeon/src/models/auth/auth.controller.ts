import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AppRequest } from 'src/common/interfaces/http';
import { AuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from 'src/common/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post("login")
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post("register")
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Request() req: AppRequest) {
    const user = await this.userService.findOne(req.user.email);
    if( !user ) throw new UnauthorizedException();
    return this.userService.toDto(user);
  }
}
