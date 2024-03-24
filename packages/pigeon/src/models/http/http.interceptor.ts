import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor, ServiceUnavailableException } from "@nestjs/common";
import { Observable, catchError } from "rxjs";
import { RequestService } from "../request/request.service";
import { 
  ParametersException, 
  UnauthorizedException,
  ForbiddenException,
  ResourceNotFoundException,
  ResourceConflictException,
  BadGatewayException,
  ServerException,
  SystemException,
} from "src/common/exceptions/system";
import { HttpRequestException } from "src/common/exceptions/http";
import { messageForNoExposeError } from "src/common/constants/exceptions";

/**
 * Intercept a RestAPI request error and throw the correct status code and message based on the business logic exception 
 */
@Injectable()
export class HttpInterceptor implements NestInterceptor {
  constructor(
    private requestService: RequestService
  ){}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp();
    if( !request ) return next.handle();

    return next.handle().pipe(
      catchError(async (err) => {
        let code = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = err.message;
        let description = 'Internal Server Error'
        const isSystemException = err instanceof SystemException;

        if( err instanceof ParametersException ) code = HttpStatus.BAD_REQUEST;
        else if (err instanceof UnauthorizedException) {
          code = HttpStatus.UNAUTHORIZED;
          description = 'Unauthorized';
        }
        else if (err instanceof ForbiddenException) {
          code = HttpStatus.FORBIDDEN;
          description = 'Forbidden';
        }
        else if (err instanceof ResourceNotFoundException) {
          code = HttpStatus.NOT_FOUND;
          description = 'Not Found';
        }
        else if (err instanceof ResourceConflictException) {
          code = HttpStatus.CONFLICT;
          description = 'Conflict';
        }
        else if (err instanceof BadGatewayException) {
          code = HttpStatus.BAD_GATEWAY;
          description = 'Bad Gateway';
        }
        else if (err instanceof ServiceUnavailableException) {
          code = HttpStatus.SERVICE_UNAVAILABLE;
          description = 'Service Unavailable';
        }
        else if (err instanceof ServerException) {
          code = HttpStatus.INTERNAL_SERVER_ERROR;
          description = 'Internal Server Error';
        }
        if( (isSystemException && !err.exposeMessage) || !isSystemException )
          message = messageForNoExposeError;

        throw new HttpRequestException({message, statusCode: code, requestId: this.requestService.getID(), description});
      })
    )
  }
}