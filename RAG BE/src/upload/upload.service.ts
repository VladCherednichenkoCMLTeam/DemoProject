import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import * as pdf from 'pdf-parse';
import * as fs from 'fs';

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
    const text = await this.splitPDFIntoParagraphs(data.text);

    fs.writeFileSync('dataText.txt', data.text);
    fs.writeFileSync('parsedText.txt', text);

    await this.processTextAndUpsert(text, fileName);
    this.logger.log(`Completed parsing and embedding PDF file: ${fileName}`);
  }

  async parseAndEmbedText(fileBuffer: Buffer, fileName: string) {
    this.logger.log(`Parsing text file: ${fileName}`);
    const text = fileBuffer.toString('utf8');
    const sanitizedText = text.replace(/(\r\n)/gm, "\n");
    await this.processTextAndUpsert(sanitizedText, fileName);
    this.logger.log(`Completed parsing and embedding text file: ${fileName}`);
  }

  private async processTextAndUpsert(text: string, fileName: string) {
    this.logger.log(`Processing text for file: ${fileName}`);
    const chunks = this.splitTextIntoChunks(text);

    const docsToUpsert = [];
    for (const [index, chunk] of chunks.entries()) {
      if (await this.isChunkIrrelevant(chunk)) {
        this.logger.log(`Skipping irrelevant chunk: ${index} \n ${chunk}`);
        continue;
      }

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
    const chunks = text.split(/\n\n/);
    return chunks;
  }

  private async splitPDFIntoParagraphs(text: string): Promise<string> {
    const pages = text.split(/\n\n/);

    const paragraphPromises = pages.map((page) =>
      this.openaiService.generateAnswerCompletion(`
        Split the following text into paragraphs. Use \\n\\n as the delimiter. Do not change the text. All references should be in one paragraph.

        Text:
        ${page}
        
        `)
    );

    const responses = await Promise.all(paragraphPromises);

    return responses.join('');
  }


  private async isChunkIrrelevant(chunk: string): Promise<boolean> {
    const prompt = `
    You are an AI assistant. Determine if the following text contains only references or irrelevant information. 
    If it does, respond with "irrelevant". Otherwise, respond with "relevant".

    Text: "${chunk}"
    `;

    const response = await this.openaiService.generateAnswerCompletion(prompt);
    return response.trim().toLowerCase().includes('irrelevant');
  }

}
