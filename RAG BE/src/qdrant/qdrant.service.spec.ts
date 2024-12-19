import { Test, TestingModule } from '@nestjs/testing';
import { chunkSize, QdrantService } from './qdrant.service';
import { AppConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/qdrant-js';

jest.mock('@qdrant/qdrant-js');

describe('QdrantService', () => {
  let service: QdrantService;
  let clientMock: jest.Mocked<QdrantClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [QdrantService, ConfigService],
    }).compile();

    service = module.get<QdrantService>(QdrantService);
    clientMock = new QdrantClient() as jest.Mocked<QdrantClient>;
    service['client'] = clientMock; // Inject the mocked client
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should ensure collection exists', async () => {
    clientMock.getCollections.mockResolvedValue({ collections: [] });
    clientMock.createCollection.mockResolvedValue(undefined);

    await service['ensureCollection']();

    expect(clientMock.getCollections).toHaveBeenCalled();
    expect(clientMock.createCollection).toHaveBeenCalledWith(service['collectionName'], {
      vectors: {
        size: chunkSize,
        distance: 'Cosine',
      },
    });
  });

  it('should upsert documents', async () => {
    const documents = [
      { vector: [0.1, 0.2, 0.3], metadata: { key: 'value' } },
    ];
    clientMock.upsert.mockResolvedValue(undefined);

    await service.upsertDocuments(documents);

    expect(clientMock.upsert).toHaveBeenCalledWith(service['collectionName'], {
      points: expect.any(Array),
    });
  });

  it('should search for documents', async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const searchResult = [
      {
        id: 'some-id',
        version: 1,
        score: 0.9,
        payload: { key: 'value' },
        vector: queryVector,
      },
    ];
    clientMock.search.mockResolvedValue(searchResult);

    const result = await service.search(queryVector);

    expect(clientMock.search).toHaveBeenCalledWith(service['collectionName'], {
      vector: queryVector,
      limit: 15,
    });
    expect(result).toEqual(searchResult);
  });
});