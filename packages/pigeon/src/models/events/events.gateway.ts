import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EntityID } from 'src/common/types/id';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  private users: Map<EntityID, string> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const jwt = this.jwtService.decode(client.handshake.auth.token);
    if (!jwt) return client.disconnect();
    this.users.set(jwt.sub, client.id);
  }

  handleDisconnect(client: Socket) {
    const jwt = this.jwtService.decode(client.handshake.auth.token);
    this.users.delete(jwt.sub);
  }

  emit(client: EntityID, event: string, payload: Record<string, any>) {
    const socketId = this.users.get(client);
    if (socketId) this.server.to(socketId).emit(event, payload);
  }
}
