import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface CursorData {
  fileId: number;
  userId: number;
  userName: string;
  userColor: string;
  offset: number;
  docSize: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
})
export class RealTimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
      this.server.emit('user-online', { userId: user.id });
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      // Leave all file rooms
      for (const room of socket.rooms) {
        if (room.startsWith('file:')) {
          socket.leave(room);
          this.server.to(room).emit('cursor-remove', { userId: user.id });
        }
      }
      this.server.emit('user-offline', { userId: user.id });
    }
  }

  @SubscribeMessage('file-open')
  handleFileOpen(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { fileId: number },
  ) {
    const room = `file:${data.fileId}`;
    socket.join(room);
    socket.to(room).emit('user-entered-file', {
      userId: socket.data.user?.id,
      fileId: data.fileId,
    });
  }

  @SubscribeMessage('file-close')
  handleFileClose(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { fileId: number },
  ) {
    const room = `file:${data.fileId}`;
    socket.leave(room);
    socket.to(room).emit('user-left-file', {
      userId: socket.data.user?.id,
      fileId: data.fileId,
    });
    socket.to(room).emit('cursor-remove', {
      userId: socket.data.user?.id,
    });
  }

  @SubscribeMessage('file-update')
  handleFileUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      fileId: number;
      content: unknown;
      name?: string;
    },
  ) {
    const room = `file:${data.fileId}`;
    socket.to(room).emit('file-updated', {
      fileId: data.fileId,
      content: data.content,
      name: data.name,
      userId: socket.data.user?.id,
    });
  }

  @SubscribeMessage('cursor-update')
  handleCursorUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CursorData,
  ) {
    const room = `file:${data.fileId}`;
    socket.to(room).emit('cursor-moved', {
      fileId: data.fileId,
      userId: socket.data.user?.id,
      userName:
        socket.data.user?.email?.split('@')[0] ||
        `User ${socket.data.user?.id}`,
      userColor: data.userColor,
      offset: data.offset,
      docSize: data.docSize,
    });
  }
}
