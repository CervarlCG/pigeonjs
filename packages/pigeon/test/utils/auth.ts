import * as request from 'supertest';
export const jwtPattern = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.([A-Za-z0-9-_=]+)?$/

export function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  const domain = 'testing';
  const tld = '.com';
  let username = '';

  for (let i = 0; i < 20; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${username}@${domain}${tld}`;
}

export async function createUser(server: any) {
  const userDto = {
    firstName: 'e2e',
    lastName: 'test',
    email: generateRandomEmail(),
    password: 'password'
  }
  const expectedUser = { firstName: userDto.firstName, lastName: userDto.lastName, email: userDto.email, id: expect.any(Number) };
  const signUp = await request(server)
      .post("/auth/register")
      .send(userDto)
      .expect(201);
  return { userDto, expectedUser, request: signUp };
}

export async function createUserAndLogin(server: any) {
  const signUp = await createUser(server);
  const login = await request(server)
      .post("/auth/login")
      .send({email: signUp.userDto.email, password: signUp.userDto.password})
      .expect(201);
  return { signUp, login: { request: login} }
}