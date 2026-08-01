import {
  WebSocketGateway,
  WebSocketServer,
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
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      // Join client to their user-specific notification room
      client.join(`user_${userId}`);
      this.logger.log(`Client connected to Notification room user_${userId}: ${client.id}`);
    } catch (err) {
      this.logger.error(`Notification Socket authentication failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Notification: ${client.id}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification:received', notification);
    }
  }

  sendNotificationReadToUser(userId: string, notificationId: string) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification:read', { id: notificationId });
    }
  }

  sendAllNotificationsReadToUser(userId: string) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification:read_all', { userId });
    }
  }
}
