import { Injectable } from '@nestjs/common';
import { QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import { threadId } from 'worker_threads';

@Injectable()
export class AskService {
  constructor(
    private readonly qdrantService: QdrantService,
    private readonly openaiService: OpenaiService,
  ) {}

  async askQuestion(question: string, chatThreadId?: string) {
    const queryEmbedding = await this.openaiService.getEmbeddingForText(question);
    const results = await this.qdrantService.search(queryEmbedding);

    const contextDocs = results.map(res => res.payload.chunk).join('\n');
    const sources: string[] = results.map(r => r.payload.source as string);
    const uniqueSources = [...new Set(sources)];


    const { answer, threadId: threadId } = await this.openaiService.generateAnswer(contextDocs, question, chatThreadId);
    return { answer, sources: uniqueSources, threadId: threadId };
  }
}
