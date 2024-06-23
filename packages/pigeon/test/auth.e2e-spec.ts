import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { jwtPattern } from './utils/auth';
import { UserAgent } from './lib/agent/users';
import { generateRandomValue } from './helper/user';
import { AgentException } from './lib/agent/exception';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should create a user successfully, allow login, retrieve user and refresh token', async () => {
    const user = await UserAgent.signUp(app);
    await user.login();
    const userCopy = await user.getInstanceOfMe();

    expect(user.me.firstName).toBeDefined();
    expect(user.me.lastName).toBeDefined();
    expect(user.me.email).toBeDefined();
    expect(user.tokens.accessToken).toMatch(jwtPattern);
    expect(user.tokens.refreshToken).toMatch(jwtPattern);
    expect(user.tokens.accessToken).not.toBe(user.tokens.refreshToken);
    expect(userCopy.me).toEqual(user.me);

    /**
     * NOTE: We don't test for not equality due it generates same token in a very short time.
     * See [https://stackoverflow.com/questions/58950775/jsonwebtoken-has-same-value-in-requests-done-within-1-second]
     */
    await user.refreshToken();
    expect(user.tokens.accessToken).toMatch(jwtPattern);
    expect(user.tokens.refreshToken).toMatch(jwtPattern);

    await UserAgent.destroy(app, user.me.id);
  });

  it('Should not allow create users with same email', async () => {
    const user1 = await UserAgent.signUp(app);
    const user2: AgentException = await UserAgent.signUp(app, {
      ...user1.me,
      password: generateRandomValue(),
    }).catch((err) => err);

    expect(user2).toBeInstanceOf(AgentException);
    expect(user2.response.status).toBe(409);

    await UserAgent.destroy(app, user1.me.id);
  });

  it("Should not allow retrive user itself if tokens aren't provided", async () => {
    const user = await UserAgent.signUp(app);
    await user.login();
    user.tokens = { accessToken: '', refreshToken: '' };

    const userCopy = await user.getInstanceOfMe().catch((err) => err);
    expect(userCopy).toBeInstanceOf(AgentException);
    expect(userCopy.statusCode).toBe(401);

    await UserAgent.destroy(app, user.me.id);
  });
});
