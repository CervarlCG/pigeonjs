import { IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { IDPattern } from 'src/common/constants/regex';

export class UpdateUserInWorkspaceDto {
  @IsNotEmpty()
  @Matches(IDPattern, { message: 'User ID was not provided' })
  userId: string;
}
