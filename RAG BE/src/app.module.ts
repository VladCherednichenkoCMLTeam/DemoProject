import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { OpenaiModule } from './openai/openai.module';
import { UploadModule } from './upload/upload.module';
import { AskModule } from './ask/ask.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception.filter';

@Module({
  imports: [
    AppConfigModule,
    QdrantModule,
    OpenaiModule,
    UploadModule,
    AskModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
			provide: APP_FILTER,
			useClass: AllExceptionsFilter
		}
  ],
})
export class AppModule {}
