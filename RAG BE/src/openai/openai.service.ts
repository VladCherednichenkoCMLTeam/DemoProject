import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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

  async generateAnswer(context: string, question: string, threadId?: string): Promise<{ answer: string, threadId: string }> {
    const prompt = `System Message:
You are a knowledgeable assistant capable of providing accurate and well-structured answers. You have access to a retrieval mechanism that supplies relevant documents or excerpts based on a user’s question. Your goal is to use the given context to produce a correct, concise, and helpful answer to the user. If the context does not provide enough information, respond with your best approximation and clearly indicate any uncertainty.

Instructions:

- Consider all provided context carefully.
- Do not fabricate details that cannot be supported by the context.
- If uncertain, acknowledge the uncertainty.
- Structure your answer in a logical, easy-to-understand manner, and cite references to the provided context if helpful.

Provided Context:
${context}

User Question: ${question}
Answer:`;
    const id = threadId ?? (await this.openai.beta.threads.create()).id;

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
      })
      .on('error', (error) => {
        this.logger.error(`Failed to send message to chatbot: ${error.message}`);
      });

    await stream.finalMessages();
    return { answer: fullAnswer, threadId: id };
  }
}
