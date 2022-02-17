import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from 'src/player';
import { PlayerListDto } from './playerList.dto';

@Injectable()
export class BattleGameService {
  playerList: Record<string, PlayerListDto> = {};

  createPlayer(client: Socket, name: string) {
    const player = new Player();
    client.data.name = name;
    console.log(client.data);

    this.playerList[name] = { client: client.id, player };
    return player;
  }

  declarationBattle(client: Socket, target: string) {
    const msg = {
      sender: client.data.name,
      recipient: target,
      message: `Will you accept my request?`,
      isBattleAccept: false,
    };

    if (this.playerList[target] === undefined) {
      msg.message = `can not find player ${target}`;
      return msg;
    }
    client.data.target = target;
    this.playerList[client.data.name].target = target;
    return this.playerList;
  }

  chargedAttack(name) {
    const damage = this.playerList[name].player.chargedAttack();
    const count = this.playerList[name].player.chargedAttackCnt;

    if (!damage) return { result: false, msg: '스킬 횟수 초과' };
    return { result: true, damage, count };
  }

  jab(name) {
    const damage = this.playerList[name].player.jab();
    const count = this.playerList[name].player.jabCnt;

    if (!damage) return { result: false, msg: '스킬 횟수 초과' };
    return { result: true, damage, count };
  }

  specialMove(name) {
    return this.playerList[name].player.specialMove();
  }

  heal(name) {
    const result = this.playerList[name].player.heal();
    const health = this.playerList[name].player.health;
    const count = this.playerList[name].player.healCnt;

    return { result, health, count };
  }

  defense(name) {
    const result = this.playerList[name].player.defense();
    const health = this.playerList[name].player.health;
    const count = this.playerList[name].player.defenseCnt;

    return { result, health, count };
  }

  damaged(target, damage) {
    return this.playerList[target].player.damaged(damage);
  }
}
