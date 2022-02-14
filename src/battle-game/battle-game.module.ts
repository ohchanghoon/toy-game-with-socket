import { Module } from '@nestjs/common';
import { BattleGameService } from './battle-game.service';

@Module({
  providers: [BattleGameService]
})
export class BattleGameModule {}
