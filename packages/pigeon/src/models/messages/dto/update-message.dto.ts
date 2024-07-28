import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { IDPattern } from 'src/common/constants/regex';
import TrimTransformer from 'src/common/validations/not-blank-transformer';

export class UpdateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10_000)
  @Transform(TrimTransformer)
  message: string;
}
