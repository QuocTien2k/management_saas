import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('TaskGateway');

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      // Giả sử JwtService được cấu hình đúng với ACCESS_TOKEN_SECRET
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub || payload.id})`);
    } catch (err) {
      this.logger.error(`Connection authentication failed for client ${client.id}: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(client: Socket, projectId: string) {
    client.join(`project_${projectId}`);
    this.logger.log(`Client ${client.id} joined room project_${projectId}`);
    return { event: 'joined', data: projectId };
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(client: Socket, projectId: string) {
    client.leave(`project_${projectId}`);
    this.logger.log(`Client ${client.id} left room project_${projectId}`);
    return { event: 'left', data: projectId };
  }

  // Phương thức helper phát sự kiện cho room dự án
  emitToProject(projectId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`project_${projectId}`).emit(event, data);
    }
  }
}
