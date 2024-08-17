import PigeonClient from "./client";

export default class PigeonSDK {
  readonly client: PigeonClient;

  constructor(baseUrl: string) {
    this.client = new PigeonClient(baseUrl);
  }
}
