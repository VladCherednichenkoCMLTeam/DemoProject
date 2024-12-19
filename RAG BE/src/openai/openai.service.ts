import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { OpenAIError } from 'openai';
import { chunkSize } from '../qdrant/qdrant.service';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  private readonly logger = new Logger(OpenaiService.name);
  constructor(private configService: ConfigService) {
    this.openai = this.initializeOpenAi(this.configService);
  }

  private initializeOpenAi(configService: ConfigService) {
    return new OpenAI({
      apiKey: configService.get('OPEN_AI_SECRET_KEY'),
    });
  }

  async getEmbeddingForText(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: "float",
      dimensions: chunkSize,
    });

    return response.data[0].embedding;
  }

  async generateAnswerInThread(
    prompt: string,
    threadId?: string,
    onDelta?: (textDelta: OpenAI.Beta.Threads.Messages.TextDelta, threadId: string, sources: string[]) => void,
    onEnd?: (message: string) => void,
    onError?: (error: OpenAIError, message: string) => void,
    uniqueSources: string[] = []
  ): Promise<{ answer: string, threadId: string }> {
    const id = threadId ?? (await this.openai.beta.threads.create(
      //   {
      //   tool_resources: {
      //     file_search: {
      //       vector_store_ids: ['vs_4bGAEmEUk32VFYEDgEHZ6P5k'],
      //     }
      //   }
      // }
    )).id;

    await this.openai.beta.threads.messages.create(id, {
      role: 'assistant',
      content: prompt,
    });

    let fullAnswer = '';
    const stream = this.openai.beta.threads.runs
      .stream(id, {
        assistant_id: this.configService.get('OPEN_AI_ASSISTANT_ID')!,
      })
      .on('textDelta', textDelta => {
        fullAnswer += textDelta?.value ?? '';
        onDelta?.(textDelta, threadId, uniqueSources);
      })
      .on('end', () => {
        onEnd?.(fullAnswer);
      })
      .on('error', (error) => {
        this.logger.error(`Failed to send message to chatbot: ${error.message}`);
        onError?.(error, fullAnswer)
      });

    await stream.finalMessages();
    return { answer: fullAnswer, threadId: id };
  }

  async generateAnswerCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: prompt }],
    });

    return response.choices[0].message.content;
  }
}