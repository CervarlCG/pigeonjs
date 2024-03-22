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
} from "src/common/exceptions";
import { HttpRequestException } from "src/common/exceptions/http";
import { notExposeErrorMessage } from "src/common/constants/exceptions";

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
        const isSystemException = err instanceof SystemException;

        if( err instanceof ParametersException ) code = HttpStatus.BAD_REQUEST;
        else if (err instanceof UnauthorizedException ) code = HttpStatus.UNAUTHORIZED;
        else if (err instanceof ForbiddenException) code = HttpStatus.FORBIDDEN;
        else if (err instanceof ResourceNotFoundException) code = HttpStatus.NOT_FOUND;
        else if (err instanceof ResourceConflictException) code = HttpStatus.CONFLICT;
        else if (err instanceof BadGatewayException) code = HttpStatus.BAD_REQUEST;
        else if (err instanceof ServiceUnavailableException) code = HttpStatus.SERVICE_UNAVAILABLE;
        else if (err instanceof ServerException) code = HttpStatus.INTERNAL_SERVER_ERROR;

        if( (isSystemException && !err.exposeCause) || !isSystemException )
          message = notExposeErrorMessage;

        throw new HttpRequestException(code, message, this.requestService.getID());
      })
    )
  }
}