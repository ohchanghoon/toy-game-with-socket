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

    if (!chargedAttack.result) {
      return client.emit('charged-attack', chargedAttack);
    }
    const health = this.battleGameService.damaged(target, chargedAttack.damage);
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

  @SubscribeMessage('jab')
  jab(client: Socket) {
    const { target } = client.data;
    const { name } = client.data;

    const jabAttack = this.battleGameService.jab(name);

    if (!jabAttack.result) return client.emit('jab', jabAttack);
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

  @SubscribeMessage('special-move')
  specialMove(client: Socket) {
    const { name } = client.data;
    const result = this.battleGameService.specialMove(name);

    if (!result) {
      return client.emit('special-move', {
        result: false,
        msg: '스킬 횟수 초과',
      });
    }
    this.server.emit('special-move', { result: false, msg: '필살기 성공' });
    this.chargedAttack(client);
    this.jab(client);
  }

  @SubscribeMessage('heal')
  heal(client: Socket) {
    const { name } = client.data;
    const heal = this.battleGameService.heal(name);

    if (!heal.result) {
      return client.emit('heal', { result: false, msg: '스킬 횟수 초과' });
    }
    const result = resultForm(
      'heal',
      heal.result,
      `${name} 체력 회복 성공`,
      heal.health,
      heal.count,
    );
    this.server.emit('heal', result);
  }

  @SubscribeMessage('defense')
  defense(client: Socket) {
    const { name } = client.data;
    const defense = this.battleGameService.defense(name);

    if (!defense.result) {
      return client.emit('defense', { result: false, msg: '스킬 횟수 초과' });
    }
    const result = resultForm(
      'defense',
      defense.result,
      '방어 성공',
      defense.health,
      defense.count,
    );
    this.server.emit('defense', result);
  }
}
