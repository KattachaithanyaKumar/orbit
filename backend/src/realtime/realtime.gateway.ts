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

interface ConnectedUser {
  userId: number;
  email: string;
  socketId: string;
  workspaceIds: Set<number>;
  activeFileId: number | null;
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

  private connectedUsers = new Map<number, ConnectedUser>();

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

      this.connectedUsers.set(user.id, {
        userId: user.id,
        email: user.email,
        socketId: socket.id,
        workspaceIds: new Set(),
        activeFileId: null,
      });

      this.server.emit('user-online', {
        userId: user.id,
        email: user.email,
      });
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      const connectedUser = this.connectedUsers.get(user.id);

      if (connectedUser) {
        for (const workspaceId of connectedUser.workspaceIds) {
          this.server.to(`workspace:${workspaceId}`).emit('user-offline', {
            userId: user.id,
            workspaceId,
          });
        }

        if (connectedUser.activeFileId !== null) {
          const fileRoom = `file:${connectedUser.activeFileId}`;
          socket.leave(fileRoom);
          this.server.to(fileRoom).emit('user-left-file', {
            userId: user.id,
            fileId: connectedUser.activeFileId,
          });
          this.server.to(fileRoom).emit('cursor-remove', {
            userId: user.id,
          });
        }

        this.connectedUsers.delete(user.id);
      }

      this.server.emit('user-offline', { userId: user.id });
    }
  }

  @SubscribeMessage('workspace-join')
  handleWorkspaceJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { workspaceId: number },
  ) {
    const user = socket.data.user;
    if (!user) return;

    const room = `workspace:${data.workspaceId}`;
    socket.join(room);

    const connectedUser = this.connectedUsers.get(user.id);
    if (connectedUser) {
      connectedUser.workspaceIds.add(data.workspaceId);
    }

    const membersInWorkspace = this.getWorkspaceMembers(data.workspaceId);
    socket.emit('workspace-members', {
      workspaceId: data.workspaceId,
      members: membersInWorkspace,
    });

    socket.to(room).emit('user-joined-workspace', {
      userId: user.id,
      email: user.email,
      workspaceId: data.workspaceId,
    });
  }

  @SubscribeMessage('workspace-leave')
  handleWorkspaceLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { workspaceId: number },
  ) {
    const user = socket.data.user;
    if (!user) return;

    const room = `workspace:${data.workspaceId}`;
    socket.leave(room);

    const connectedUser = this.connectedUsers.get(user.id);
    if (connectedUser) {
      connectedUser.workspaceIds.delete(data.workspaceId);
    }

    socket.to(room).emit('user-left-workspace', {
      userId: user.id,
      workspaceId: data.workspaceId,
    });
  }

  @SubscribeMessage('file-open')
  handleFileOpen(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { fileId: number },
  ) {
    const user = socket.data.user;
    if (!user) return;

    const room = `file:${data.fileId}`;
    socket.join(room);

    const connectedUser = this.connectedUsers.get(user.id);
    if (connectedUser) {
      connectedUser.activeFileId = data.fileId;
    }

    const viewersInFile = this.getFileViewers(data.fileId);
    socket.emit('file-viewers', {
      fileId: data.fileId,
      viewers: viewersInFile,
    });

    socket.to(room).emit('user-entered-file', {
      userId: user.id,
      email: user.email,
      fileId: data.fileId,
    });
  }

  @SubscribeMessage('file-close')
  handleFileClose(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { fileId: number },
  ) {
    const user = socket.data.user;
    if (!user) return;

    const room = `file:${data.fileId}`;
    socket.leave(room);

    const connectedUser = this.connectedUsers.get(user.id);
    if (connectedUser) {
      connectedUser.activeFileId = null;
    }

    socket.to(room).emit('user-left-file', {
      userId: user.id,
      fileId: data.fileId,
    });
    socket.to(room).emit('cursor-remove', {
      userId: user.id,
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
    const user = socket.data.user;
    if (!user) return;

    const room = `file:${data.fileId}`;
    socket.to(room).emit('file-updated', {
      fileId: data.fileId,
      content: data.content,
      name: data.name,
      userId: user.id,
    });
  }

  @SubscribeMessage('cursor-update')
  handleCursorUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CursorData,
  ) {
    const user = socket.data.user;
    if (!user) return;

    const room = `file:${data.fileId}`;
    socket.to(room).emit('cursor-moved', {
      fileId: data.fileId,
      userId: user.id,
      userName: user.email?.split('@')[0] || `User ${user.id}`,
      userColor: data.userColor,
      offset: data.offset,
      docSize: data.docSize,
    });
  }

  private getWorkspaceMembers(workspaceId: number) {
    const members: { userId: number; email: string }[] = [];
    for (const [, connectedUser] of this.connectedUsers) {
      if (connectedUser.workspaceIds.has(workspaceId)) {
        members.push({
          userId: connectedUser.userId,
          email: connectedUser.email,
        });
      }
    }
    return members;
  }

  private getFileViewers(fileId: number) {
    const viewers: { userId: number; email: string }[] = [];
    for (const [, connectedUser] of this.connectedUsers) {
      if (connectedUser.activeFileId === fileId) {
        viewers.push({
          userId: connectedUser.userId,
          email: connectedUser.email,
        });
      }
    }
    return viewers;
  }
}
