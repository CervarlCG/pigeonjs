export interface ErrorType {
  message: string;
  error: string;
  statusCode: number;
  requestId?: string;
}

export default class RequestError extends Error {
  response: Response;
  body: ErrorType;
  constructor(response: Response, body: ErrorType, message?: string) {
    super(message);
    this.response = response;
    this.body = body;
  }
}
