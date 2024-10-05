import {
  User,
  Workspace,
  Channel,
  Message,
  MessageAttachment,
} from "pigeon-types/entities";
import { UserRoles } from "pigeon-types/index";

export const mockUsers: User[] = [
  {
    id: 1,
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: UserRoles.ADMIN,
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: UserRoles.TEAM_MATE,
  },
  {
    id: 3,
    email: "bob.jones@example.com",
    firstName: "Bob",
    lastName: "Jones",
    role: UserRoles.TEAM_MATE,
  },
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 1,
    name: "Design Team",
    handle: "design-team",
    createdAt: "2024-01-01T10:00:00Z",
    owner: mockUsers[0],
    users: [mockUsers[0], mockUsers[1]],
  },
  {
    id: 2,
    name: "Development Team",
    handle: "dev-team",
    createdAt: "2024-02-01T10:00:00Z",
    owner: mockUsers[1],
    users: [mockUsers[1], mockUsers[2]],
  },
];

export const mockChannels: Channel[] = [
  {
    id: 1,
    name: "General",
    handle: "general",
    privacy: "public",
    idDM: false,
    createdAt: "2024-03-01T10:00:00Z",
    workspaceId: 1,
    users: [mockUsers[0], mockUsers[1]],
  },
  {
    id: 2,
    name: "Private Channel",
    handle: "private-channel",
    privacy: "private",
    idDM: false,
    createdAt: "2024-03-02T10:00:00Z",
    workspaceId: 2,
    users: [mockUsers[1], mockUsers[2]],
  },
  {
    id: 3,
    name: "Direct Message",
    handle: "dm-john-jane",
    privacy: "private",
    idDM: true,
    createdAt: "2024-03-03T10:00:00Z",
    workspaceId: 1,
    users: [mockUsers[0], mockUsers[1]],
  },
];

export const mockMessageAttachments: MessageAttachment[] = [
  {
    id: 1,
    url: "https://example.com/attachments/1",
    previewURL: "https://example.com/attachments/1/preview",
    mimetype: "image/png",
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: 2,
    url: "https://example.com/attachments/2",
    previewURL: "https://example.com/attachments/2/preview",
    mimetype: "application/pdf",
    createdAt: "2024-04-01T10:10:00Z",
  },
];

export const mockMessages: Message[] = [
  {
    id: 1,
    content: "Hello everyone!",
    channel: mockChannels[0],
    user: mockUsers[0],
    createdAt: "2024-04-01T10:00:00Z",
    attachments: [],
  },
  {
    id: 2,
    content: "Here is the document you requested.",
    channel: mockChannels[1],
    user: mockUsers[1],
    createdAt: "2024-04-01T10:15:00Z",
    attachments: [mockMessageAttachments[1]],
  },
  {
    id: 3,
    content: "Check out this image.",
    channel: mockChannels[2],
    user: mockUsers[2],
    createdAt: "2024-04-01T10:20:00Z",
    attachments: [mockMessageAttachments[0]],
  },
  {
    id: 4,
    content: "That is a funny meme haha.",
    channel: mockChannels[2],
    user: mockUsers[2],
    createdAt: "2024-08-19T10:20:00Z",
    attachments: [mockMessageAttachments[0]],
  },
];
