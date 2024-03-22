import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError } from "rxjs";
import { LoggerService } from "./logger.service";
import { RequestService } from "../request/request.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private loggerService: LoggerService,
    private requestService: RequestService
  ){}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError(async (err) => {
        await this.loggerService.error(err, this.requestService.getID()).catch(console.error);
        throw err;
      })
    )
  }
}