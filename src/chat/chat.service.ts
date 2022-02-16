import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from './chat-user';

@Injectable()
export class ChatService {
  //   constructor(private user: User) {}
  createUser(client: Socket, data: any): any {
    const user = new User();

    user.name = data.name;
    user.id = data.id;
    user.age = data.age;
    user.height = data.height;
    user.univ = data.univ;

    return user;
  }
}
