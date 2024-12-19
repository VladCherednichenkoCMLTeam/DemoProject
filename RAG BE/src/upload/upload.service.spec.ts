import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import * as pdf from 'pdf-parse';

jest.mock('pdf-parse', () => jest.fn().mockResolvedValue({ text: 'Mocked PDF text content' }));

describe('UploadService', () => {
  let service: UploadService;
  let qdrantService: QdrantService;
  let openaiService: OpenaiService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: QdrantService,
          useValue: {
            upsertDocuments: jest.fn(),
          },
        },
        {
          provide: OpenaiService,
          useValue: {
            getEmbeddingForText: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
            generateAnswerCompletion: jest.fn().mockResolvedValue('Sample PDF text'),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    qdrantService = module.get<QdrantService>(QdrantService);
    openaiService = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAndEmbedPDF', () => {
    it('should parse PDF and upsert documents', async () => {
      const mockPdfData = { text: 'Sample PDF text' };
      (pdf as jest.Mock).mockResolvedValue(mockPdfData);

      await service.parseAndEmbedPDF(Buffer.from(''), 'test.pdf');

      expect(pdf).toHaveBeenCalled();
      expect(openaiService.getEmbeddingForText).toHaveBeenCalledWith('Sample PDF text');
      expect(qdrantService.upsertDocuments).toHaveBeenCalled();
    });
  });

  describe('parseAndEmbedText', () => {
    it('should parse text and upsert documents', async () => {
      const text = 'Sample text content';
      await service.parseAndEmbedText(Buffer.from(text), 'test.txt');

      expect(openaiService.getEmbeddingForText).toHaveBeenCalledWith(text);
      expect(qdrantService.upsertDocuments).toHaveBeenCalled();
    });
  });

  describe('processTextAndUpsert', () => {
    it('should split text into chunks and upsert', async () => {
      const text = 'This is a sample text for testing the chunking and upserting process.';
      const chunks = service['splitTextIntoChunks'](text);

      expect(chunks.length).toBeGreaterThan(0);
      await service['processTextAndUpsert'](text, 'test.txt');

      expect(openaiService.getEmbeddingForText).toHaveBeenCalledTimes(1);
      expect(qdrantService.upsertDocuments).toHaveBeenCalled();
    });
  });
});
