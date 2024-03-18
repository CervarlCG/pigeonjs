import { Column, Entity } from "typeorm";

export enum LogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export enum RequestType {
  REST_API = "RESTAPI",
  SYSTEM = "SYSTEM"
}

@Entity("logs")
export class Logs {
  @Column()
  requestId: string

  @Column({
    enum: RequestType
  })
  requestPath: string;

  @Column()
  requestType: string

  @Column()
  message: string;

  @Column({
    enum: LogLevel
  })
  level: string;

  @Column()
  trace: string;
}