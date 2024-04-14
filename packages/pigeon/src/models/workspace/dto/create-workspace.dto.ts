import { IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { handleFormat } from 'src/common/constants/messages';
import { HandlePattern } from 'src/common/constants/regex';

export class CreateWorkspaceDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @Matches(HandlePattern, {
    message: handleFormat,
  })
  handle: string;
}
