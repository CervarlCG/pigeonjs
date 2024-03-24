import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResourceNotFoundException, UnauthorizedException } from 'src/common/exceptions/system';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ){}

  async signIn(user: User) {
    const payload = this.getJwtPayload(user)
    return { 
      user: this.userService.toDto(user), 
      token: {
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.generateNewRefreshToken(user)
    } }
  }

  async refreshToken( accessToken: string, refreshToken: string  ) {
    try {
      const { email } = this.jwtService.decode(accessToken);
      const user = await this.userService.findOne(email);
  
      if( !user || refreshToken !== user.refreshToken ) throw new UnauthorizedException();

      const response: any = await this.jwtService.verifyAsync(user.refreshToken).catch(() => {});

      if( !response?.email ) throw new UnauthorizedException();

      const { token } = await this.signIn(user);

      return token;
    } catch (err) {
      throw new UnauthorizedException("Tokens provided are invalid.")
    }
    
  }

  async signUp( userInput: CreateUserDto ) {
    const user = await this.userService.create(userInput);
    return this.userService.toDto(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);

    if( !user || !this.userService.verifyPassword(user.password, password) ) 
      return null;

    return this.userService.toDto(user);
  }

  getJwtPayload(user: User) {
    return {sub: user.id, email: user.email};
  }

  async generateNewRefreshToken( user: User ) {
    const payload = this.getJwtPayload(user);
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30 days'});
    await this.userService.setRefreshToken(user.id, refreshToken);
    return refreshToken;
  }
}
