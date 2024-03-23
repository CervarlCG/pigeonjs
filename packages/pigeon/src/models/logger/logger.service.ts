import { Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Log } from "./entities/logger.entity";
import { LogRecord, LogLevel } from "./types";

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
  ){}

  async log(logRecord: LogRecord): Promise<Log | null> {
    try {
      const log = this.logsRepository.create(logRecord);
      return await this.logsRepository.save(log);
    } catch(err) {
      return null
    }
  }

  async error(err: Error, requestId: string) {
    if( !(err instanceof Error) ) return;
    const logRecord = {
      level: LogLevel.ERROR,
      message: err.message,
      trace: err.stack || "",
      requestId,
    }
    const logSaved = await this.log(logRecord).catch(err => null);
    return logSaved;
  }

  async find( requestId: string ) {
    return this.logsRepository.findOne({where: { requestId }})
  }

  async remove( requestId: string ) {
    return this.logsRepository.delete({requestId});
  }
}
