import { Controller, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { ParametersException } from 'src/common/exceptions';

@Controller('user')
export class UserController {
}

