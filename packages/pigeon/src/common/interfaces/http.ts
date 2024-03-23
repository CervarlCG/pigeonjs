import { Request } from "express";

export interface AppRequest extends Request {
  user: JwtUser
}

export interface JwtUser {
  sub: number;
  email: string;
}