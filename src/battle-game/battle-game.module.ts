import { Module } from '@nestjs/common';
import { BattleGameGateway } from './battle-game.gateway';
import { BattleGameService } from './battle-game.service';

@Module({
  providers: [BattleGameService, BattleGameGateway],
  // exports: [BattleGameService],
})
export class BattleGameModule {}
