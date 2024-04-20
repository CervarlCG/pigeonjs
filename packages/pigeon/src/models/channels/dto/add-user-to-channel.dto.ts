import { IsNotEmpty, Matches } from 'class-validator';
import { IDPattern } from 'src/common/constants/regex';

export class UpdateUserAtChannelDto {
  @IsNotEmpty()
  @Matches(IDPattern, { message: 'User ID was not provided' })
  userId: string;
}
