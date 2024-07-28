import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { IDPattern } from 'src/common/constants/regex';
import TrimTransformer from 'src/common/validations/not-blank-transformer';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10_000)
  @Transform(TrimTransformer)
  message: string;

  @IsNotEmpty()
  @Matches(IDPattern, { message: 'Channel ID was not provided' })
  channelId: string;
}
