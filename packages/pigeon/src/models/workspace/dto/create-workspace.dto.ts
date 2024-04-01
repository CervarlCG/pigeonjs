import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  handle: string;
}
