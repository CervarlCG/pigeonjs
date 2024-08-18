import { User } from "pigeon-types/entities/user";
import RequestError from "./error";

export interface ClientAuthProps {
  email: string;
  password: string;
}

export default class PigeonClient {
  private baseUrl: string;
  private retries = 3;
  private user!: User;
  private tokens = {
    accessToken: "",
    refreshToken: "",
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get accessToken() {
    return this.tokens.accessToken;
  }

  get refreshToken() {
    return this.tokens.refreshToken;
  }

  get me() {
    return this.user;
  }

  /**
   * Request a endpoint to the server
   * @param endpoint The endpoint to request
   * @param init The request options params
   * @param retry The current retry (do not pass this parameter on your calls)
   * @returns A Json response
   */
  async request(endpoint: string, init?: RequestInit, retry = 0): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.tokens.accessToken
          ? { Authorization: `bearer ${this.tokens.accessToken}` }
          : {}),
        ...init?.headers,
      },
    });

    if (
      response.status === 401 &&
      this.tokens.accessToken &&
      this.tokens.refreshToken
    ) {
      await this.refreshCurrentToken();
    }

    if (!response.ok && retry < this.retries && this.tokens.accessToken) {
      return this.request(endpoint, init, retry + 1);
    }

    if (!response.ok) {
      throw new RequestError(response, await response.json());
    }

    return await response.json();
  }

  /**
   * Authenticate the current client
   * @param credentials The user credentials
   */
  async authenticate(credentials: ClientAuthProps) {
    const { user, token } = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.tokens = token;
    this.user = user;
  }

  /**
   * Refresh the current expired token
   */
  async refreshCurrentToken() {
    const { user, token } = await this.request("/auth/refresh-token", {
      body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
    });
    this.tokens = token;
    this.user = user;
  }
}
