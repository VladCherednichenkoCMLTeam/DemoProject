import { Injectable, Logger } from '@nestjs/common';
import { chunkSize, QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import * as pdf from 'pdf-parse';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly openaiService: OpenaiService,
  ) {}

  async parseAndEmbedPDF(fileBuffer: Buffer, fileName: string) {
    this.logger.log(`Parsing PDF file: ${fileName}`);
    const data = await pdf(fileBuffer);
    const text = data.text;
    await this.processTextAndUpsert(text, fileName);
    this.logger.log(`Completed parsing and embedding PDF file: ${fileName}`);
  }

  async parseAndEmbedText(fileBuffer: Buffer, fileName: string) {
    this.logger.log(`Parsing text file: ${fileName}`);
    const text = fileBuffer.toString('utf8');
    await this.processTextAndUpsert(text, fileName);
    this.logger.log(`Completed parsing and embedding text file: ${fileName}`);
  }

  private async processTextAndUpsert(text: string, fileName: string) {
    this.logger.log(`Processing text for file: ${fileName}`);
    const chunks = this.splitTextIntoChunks(text);

    const docsToUpsert = [];
    for (const [index, chunk] of chunks.entries()) {
      const embedding = await this.openaiService.getEmbeddingForText(chunk);
      docsToUpsert.push({
        vector: embedding,
        metadata: { chunk, source: fileName },
      });
    }
    await this.qdrantService.upsertDocuments(docsToUpsert);
    this.logger.log(`Completed upserting documents for file: ${fileName}`);
  }

  private splitTextIntoChunks(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
  }
}
