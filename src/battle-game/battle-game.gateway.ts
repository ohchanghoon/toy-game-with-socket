import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BattleGameService } from './battle-game.service';
import { resultForm } from './resultForm';

@WebSocketGateway()
export class BattleGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private battleGameService: BattleGameService) {}

  @WebSocketServer()
  server: Server;
  handleConnection(client: Socket, ...args: any[]) {
    const name = client.handshake.query['name'] as string;
    client.data.name = name;
    client.rooms.clear();

    const player = this.battleGameService.createPlayer(client, name);
    this.server.emit('player-info', player);
  }

  handleDisconnect(client: any) {
    delete this.battleGameService.playerList[client.data.name];
  }

  @SubscribeMessage('battle-request')
  battle(client: Socket, message) {
    const { target } = message;
    const targetClient = this.server.sockets.sockets.get(
      this.battleGameService.playerList[target].client,
    );
    const msg = this.battleGameService.declarationBattle(client, targetClient);
    client.emit('battle-request', msg);
    if (msg.isBattleAccept) {
      this.autoAttack(client);
    }
  }

  autoAttack(client: Socket) {
    const { target } = client.data;
    const { name } = client.data;

    const interval = setInterval(() => {
      if (
        typeof this.battleGameService.playerList[client.data.name] ===
        'undefined'
      ) {
        clearInterval(interval);
        return;
      } else {
        const damage1 = this.battleGameService.autoAttack(name);
        const damage2 = this.battleGameService.autoAttack(target);
        const health1 = this.battleGameService.damaged(target, damage1);
        const health2 = this.battleGameService.damaged(name, damage2);

        const result1 = resultForm(
          'auto-attack',
          true,
          '기본 공격 성공',
          health1,
          undefined,
          damage1,
        );
        const result2 = resultForm(
          'auto-attack',
          true,
          '기본 공격 성공',
          health2,
          undefined,
          damage2,
        );
        this.server.to(client.data.roomId).emit('battle-message', result1);
        this.server.to(client.data.roomId).emit('battle-message', result2);
        if (health1 <= 0 && health2 <= 0) {
          this.battleEnd(name, target, 'tie');
          clearInterval(interval);
        } else if (health1 <= 0) {
          this.battleEnd(name, target, name);
          clearInterval(interval);
        } else if (health2 <= 0) {
          this.battleEnd(name, target, target);
          clearInterval(interval);
        }
      }
    }, 1000);
  }

  @SubscribeMessage('charged-attack')
  chargedAttack(client: Socket): any {
    const { target } = client.data;
    const { name } = client.data;

    const chargedAttack = this.battleGameService.chargedAttack(name);

    if (!chargedAttack.result) {
      return client.emit('battle-message', chargedAttack);
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

    this.server.to(client.data.roomId).emit('battle-message', result);
    if (health <= 0) this.battleEnd(name, target, name);
  }

  @SubscribeMessage('jab')
  jab(client: Socket) {
    const { target } = client.data;
    const { name } = client.data;

    const jabAttack = this.battleGameService.jab(name);

    if (!jabAttack.result) return client.emit('battle-message', jabAttack);
    const health = this.battleGameService.damaged(target, jabAttack.damage);
    const result = resultForm(
      'jab',
      jabAttack.result,
      '잽 공격 성공',
      health,
      jabAttack.count,
      jabAttack.damage,
    );
    this.server.to(client.data.roomId).emit('battle-message', result);
    if (health <= 0) this.battleEnd(name, target, name);
  }

  @SubscribeMessage('special-move')
  specialMove(client: Socket) {
    const { name } = client.data;
    const result = this.battleGameService.specialMove(name);

    if (!result) {
      return client.emit('battle-message', {
        result: false,
        msg: '스킬 횟수 초과',
      });
    }
    this.server
      .to(client.data.roomId)
      .emit('battle-message', { result: true, msg: '필살기 성공' });
    this.chargedAttack(client);
    this.jab(client);
  }

  @SubscribeMessage('heal')
  heal(client: Socket) {
    const { name } = client.data;
    const heal = this.battleGameService.heal(name);

    if (!heal.result) {
      return client.emit('battle-message', {
        result: false,
        msg: '스킬 횟수 초과',
      });
    }
    const result = resultForm(
      'heal',
      heal.result,
      `${name} 체력 회복 성공`,
      heal.health,
      heal.count,
    );
    this.server.to(client.data.roomId).emit('battle-message', result);
  }

  @SubscribeMessage('defense')
  defense(client: Socket) {
    const { name } = client.data;
    const defense = this.battleGameService.defense(name);

    if (!defense.result) {
      return client.emit('battle-message', {
        result: false,
        msg: '스킬 횟수 초과',
      });
    }
    const result = resultForm(
      'defense',
      defense.result,
      '방어 성공',
      defense.health,
      defense.count,
    );
    this.server.to(client.data.roomId).emit('battle-message', result);
  }

  battleEnd(clientA: string, clientB: string, winner: string) {
    const socketA = this.server.sockets.sockets.get(
      this.battleGameService.playerList[clientA].client,
    );
    const socketB = this.server.sockets.sockets.get(
      this.battleGameService.playerList[clientB].client,
    );
    if (socketA.data.roomId || socketB.data.roomId) {
      this.server.emit('battle-end', {
        winner,
        message: 'battle end',
      });

      socketA.rooms.clear();
      socketB.rooms.clear();
      delete socketA.data.roomId;
      delete socketB.data.roomId;
      delete socketA.data.target;
      delete socketB.data.target;
    }
  }
}
