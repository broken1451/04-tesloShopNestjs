import { Module } from '@nestjs/common';
import { MessageWsService } from './message-ws.service';
import { MessageWsGateway } from './message-ws.gateway'; // seria como el controller
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [MessageWsGateway, MessageWsService],
  imports: [AuthModule]
})
export class MessageWsModule {}
