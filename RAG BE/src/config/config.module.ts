import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        OPEN_AI_SECRET_KEY: Joi.string().pattern(/^sk-/).required(),
        OPEN_AI_ASSISTANT_ID: Joi.string().pattern(/^asst_/).required(),
        QDRANT_URL: Joi.string().uri().required(),
        QDRANT_COLLECTION: Joi.string().required(),
      })
    }),
  ],
})
export class AppConfigModule {}
