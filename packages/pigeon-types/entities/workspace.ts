import { User } from "./user";

export interface Workspace {
  id: number;
  name: string;
  handle: string;
  createdAt: string;
  owner: User;
  users: User[];
}
