import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Privacy } from 'src/common/constants/private';

export class UpdateChannelDto {
  @IsOptional()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;
}
