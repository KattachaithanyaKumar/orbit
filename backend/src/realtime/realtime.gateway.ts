import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
})
export class RealTimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'orbit-secret',
      });
      const user = await this.usersService.findOne(payload.sub as number);
      if (!user) {
        socket.disconnect();
        return;
      }

      socket.data.user = user;

      // Mark user as online
      socket.data.user.online = true;
      this.server.emit('user-online', { userId: user.id });
    } catch (error) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      user.online = false;
      this.server.emit('user-offline', { userId: user.id });
    }
  }
}