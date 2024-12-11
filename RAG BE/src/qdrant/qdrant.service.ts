import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';

export const chunkSize = 512;

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private collectionName: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new QdrantClient({ url: this.configService.get('QDRANT_URL') });
    this.collectionName = this.configService.get('QDRANT_COLLECTION')!;
    await this.ensureCollection();
  }

  private async ensureCollection() {
    const collections = await this.client.getCollections();
    const exists = collections?.collections?.some(c => c.name === this.collectionName);
    if (!exists) {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: chunkSize,
          distance: 'Cosine',
        },
      });
    }
  }

  async upsertDocuments(documents: { vector: number[]; metadata: any }[]) {
    const points = documents.map(doc => ({
      id: uuidv4(),
      vector: doc.vector,
      payload: doc.metadata,
    }));

    await this.client.upsert(this.collectionName, { points });
  }

  async search(queryVector: number[], limit = 5) {
    return this.client.search(this.collectionName, {
      vector: queryVector,
      limit,
    });
  }
}
