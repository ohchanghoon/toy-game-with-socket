import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
  @SubscribeMessage('test')
  handleMessage(client: Socket, data: any): void {
    client.emit('test', 'hello');
  }

  @SubscribeMessage('send')
  send(client: Socket, data: any): void {
    const user = this.chatService.createUser(client, data);
    client.broadcast.emit('send', user);
  }
}
