import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "src/common/exceptions/system";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor( private authService: AuthService ) {
    super({usernameField: 'email'});
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    if( !user )
      throw new UnauthorizedException("Authentication failed. Please check your login details and try again.");

    return user;
  }
}