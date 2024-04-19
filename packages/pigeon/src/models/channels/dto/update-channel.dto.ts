import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateChannelDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
