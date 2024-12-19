import { Module } from '@nestjs/common';
import { AskController } from './ask.controller';
import { AskService } from './ask.service';
import { QdrantModule } from '../qdrant/qdrant.module';
import { OpenaiModule } from '../openai/openai.module';
import { AskGateway } from './gateway/ask.gateway';

@Module({
  imports: [QdrantModule, OpenaiModule],
  controllers: [AskController],
  providers: [AskService, AskGateway],
  exports: [AskService, AskGateway],
})
export class AskModule {}
