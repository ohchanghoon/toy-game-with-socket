import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { BattleGameService } from './battle-game.service';
import { resultForm } from './resultForm';

@WebSocketGateway()
export class BattleGameGateway {
  constructor(private battleGameService: BattleGameService) {}

  @WebSocketServer()
  server: Server;
  handleConnection(client: Socket) {
    const name = client.handshake.query['name'] as string;
    client.data.name = name;
    client.leave(client.id);

    const player = this.battleGameService.createPlayer(client, name);
    this.server.emit('player-info', player);
  }

  @SubscribeMessage('battle-request')
  battle(client: Socket, message) {
    const { target } = message;
    const msg = this.battleGameService.declarationBattle(client, target);
    client.emit('battle-request', msg);
  }

  @SubscribeMessage('charged-attack')
  chargedAttack(client: Socket): any {
    const { target } = client.data;
    const { name } = client.data;

    const chargedAttack = this.battleGameService.chargedAttack(name);
    if (!chargedAttack.result) client.emit('charged-attack', chargedAttack);
    else {
      const health = this.battleGameService.damaged(
        target,
        chargedAttack.damage,
      );
      const result = resultForm(
        'charged-attack',
        chargedAttack.result,
        '강 공격 성공',
        health,
        chargedAttack.count,
        chargedAttack.damage,
      );

      this.server.emit('charged-attack', result);
    }
  }

  @SubscribeMessage('jab')
  jab(client: Socket) {
    const { target } = client.data;
    const { name } = client.data;

    const jabAttack = this.battleGameService.jab(name);
    if (!jabAttack.result) client.emit('jab', jabAttack);
    else {
      const health = this.battleGameService.damaged(target, jabAttack.damage);
      const result = resultForm(
        'jab',
        jabAttack.result,
        '잽 공격 성공',
        health,
        jabAttack.count,
        jabAttack.damage,
      );
      this.server.emit('jab', result);
    }
  }

  @SubscribeMessage('special-move')
  specialMove(client: Socket) {
    const { target } = client.data;
    const { name } = client.data;

    const result = this.battleGameService.specialMove(name);
  }
}
