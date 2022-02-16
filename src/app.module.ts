import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BattleGameModule } from './battle-game/battle-game.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [BattleGameModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
