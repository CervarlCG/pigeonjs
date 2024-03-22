import { HttpException, HttpExceptionOptions, HttpStatus } from "@nestjs/common";

export class HttpRequestException extends HttpException {
  constructor(status: number, error: string, requestId: string, options?: HttpExceptionOptions) {
    super({
      status,
      error,
      requestId,
    }, status, options);
  }
}