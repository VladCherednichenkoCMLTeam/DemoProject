import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { QdrantModule } from '../qdrant/qdrant.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [QdrantModule, OpenaiModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
