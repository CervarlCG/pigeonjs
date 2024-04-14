import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { handleFormat } from 'src/common/constants/messages';
import { Privacy } from 'src/common/constants/private';
import { HandlePattern, IDPattern } from 'src/common/constants/regex';

export class CreateChannelDto {
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

  @IsNotEmpty()
  @Matches(IDPattern, { message: 'Workspace ID was not provided' })
  workspaceId: string;

  @IsEnum(Privacy)
  privacy: Privacy;

  @IsBoolean()
  isDM: boolean;
}
