import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from 'src/common/exceptions/system';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  signIn(@Request() req: any) {
    return this.authService.signIn(req.user);
  }

  @Post("register")
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getLoggedInUser(@Request() req: any) {
    const user = await this.userService.findOne(req.user.email);
    if( !user ) throw new UnauthorizedException();
    return this.userService.toDto(user);
  }
}
