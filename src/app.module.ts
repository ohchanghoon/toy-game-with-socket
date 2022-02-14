import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BattleGameModule } from './battle-game/battle-game.module';
import { BattleGameGateway } from './battle-game/battle-game.gateway';

@Module({
  imports: [BattleGameModule],
  controllers: [AppController],
  providers: [AppService, BattleGameGateway],
})
export class AppModule {}
