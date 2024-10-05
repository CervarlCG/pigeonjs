import PigeonClient from "./client";

export default class PigeonWorkspace {
  private client: PigeonClient;

  constructor(client: PigeonClient) {
    this.client = client;
  }

  async list() {
    return this.client.request("/workspaces");
  }
}
