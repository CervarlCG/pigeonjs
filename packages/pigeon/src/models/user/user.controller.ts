import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UnauthorizedException } from 'src/common/exceptions/system';


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private userService: UserService
  ) {}

  @Get("me")
  async getLoggedInUser(@Request() req: any) {
    const user = await this.userService.findOne(req.user.email);
    if( !user ) throw new UnauthorizedException();
    return this.userService.toDto(user);
  }
}