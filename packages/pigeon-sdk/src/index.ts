import PigeonClient from "./client";
import PigeonWorkspace from "./workspace";

export default class PigeonSDK {
  readonly client: PigeonClient;
  readonly workspaces: PigeonWorkspace;

  constructor(baseUrl: string) {
    this.client = new PigeonClient(baseUrl);
    this.workspaces = new PigeonWorkspace(this.client);
  }
}
