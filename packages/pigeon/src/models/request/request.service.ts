import { Injectable, Scope } from "@nestjs/common";
import { v4 } from "uuid";

interface RequestInstance {
  requestId: string;
  requestType: string;
  requestPath: string;
}

@Injectable({scope: Scope.REQUEST})
export class RequestService {
  private requestId: string;

  constructor() {
    this.requestId = v4();
  }

  getID() {
    return this.requestId;
  }
}