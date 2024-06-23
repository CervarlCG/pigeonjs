import { Response } from 'supertest';

export class AgentException extends Error {
  statusCode: number;
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
    this.statusCode = response.status;
  }
}
