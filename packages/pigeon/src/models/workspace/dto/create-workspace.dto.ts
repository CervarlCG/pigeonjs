import { IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateWorkspaceDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Handle only can contain letters (uppercase and lowercase), numbers, hyphens, and underscores',
  })
  handle: string;
}
