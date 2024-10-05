import { User } from "./user";
export interface Channel {
    id: number;
    name: string;
    handle: string;
    privacy: string;
    idDM: boolean;
    createdAt: string;
    workspaceId: number;
    users: User[];
}
