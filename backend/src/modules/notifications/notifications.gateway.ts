import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`[NotificationsGateway] Socket ${client.id} joined room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[NotificationsGateway] Socket ${client.id} disconnected`);
  }

  sendNotification(userId: string, notification: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification', notification);
    }
  }

  broadcastScheduleUpdate(doctorId: string) {
    if (this.server) {
      this.server.emit('schedule_updated', { doctorId });
    }
  }
}
