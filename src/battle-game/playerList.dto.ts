import { Player } from 'src/player';

export class PlayerListDto {
  player: Player;
  client: string;
  target?: string;
}
