import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { credentials: true, methods: ['GET', 'POST'], origin: [
    'http://localhost:3000',
    'https://updevcommunity.com',
    'https://www.updevcommunity.com',
    'https://updevcommunity.com:3017',
    'https://www.updevcommunity.com:3017',
    'https://updev-community.vercel.app',
  ]},
  transports: ['polling', 'websocket'],
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('notification')
  handleMessage(client: Socket, payload: string): void {
    this.server.emit('notification', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
