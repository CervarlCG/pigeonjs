import { Channel } from "./channel";
import { User } from "./user";
export interface Message {
    id: number;
    content: string;
    channel: Channel;
    user: User;
    createdAt: string;
    attachments: MessageAttachment[];
}
export interface MessageAttachment {
    id: number;
    url: string;
    previewURL: string;
    mimetype: string;
    createdAt: string;
}
