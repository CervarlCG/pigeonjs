import { UserService } from 'src/models/user/user.service';
import { UserRoles } from 'pigeon-types';
import { AuthService } from 'src/models/auth/auth.service';
import { User } from 'src/models/user/entities/user.entity';

const firstNames = ['Sophia', 'Benjamin', 'Ava', 'Ethan', 'Isabella'];
const lastNames = ['Smith', 'Johnson', 'Garcia', 'Martinez', 'Brown'];

export interface ITestUser {
  user: User;
  password: string;
  token: { accessToken: string; refreshToken: string };
}

export async function signUp(
  userService: UserService,
  authService: AuthService,
  role = UserRoles.TEAM_MATE,
) {
  const { firstName, lastName } = getRandomName();
  const email = generateRandomEmail();
  const password = generateRandomValue();
  const user = await userService.create(
    { firstName, lastName, email, password },
    role,
  );
  const { token } = await authService.signIn(user);

  return { user, password, token };
}

export async function signUpAccounts(
  userService: UserService,
  authService: AuthService,
  roles: UserRoles[],
  length = 5,
) {
  const users = [];
  for (let i = 0; i < length; i++) {
    users.push(await signUp(userService, authService, roles[i]));
  }
  return users;
}

export function getRandomName() {
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * firstNames.length)],
  };
}

export function generateRandomEmail() {
  const username = generateRandomValue();
  const domain = 'testing';
  const tld = '.com';
  return `${username}@${domain}${tld}`;
}

export function generateRandomValue(length = 20, prefix = '') {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let value = '';
  for (let i = 0; i < length; i++) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + value;
}
