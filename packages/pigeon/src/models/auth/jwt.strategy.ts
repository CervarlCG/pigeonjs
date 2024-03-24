import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * JwtStrategy class that extends PassportStrategy with JWT authentication.
 * It uses the JWT token from the authorization header as a bearer token
 * and validates it using the secret key from environment variables.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY
    });
  }

  /**
   * Validates the payload of the JWT token and returns the user object.
   * @param payload - The payload of the JWT token.
   * @returns The user object with id and email properties.
   */
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}