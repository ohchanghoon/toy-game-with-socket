import { Module } from '@nestjs/common';
import { User } from './chat-user';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService, ChatGateway, User],
  exports: [User],
})
export class ChatModule {}
