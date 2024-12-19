import { Test, TestingModule } from '@nestjs/testing';
import { AskService } from './ask.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import { AppConfigModule } from '../config/config.module';

describe('AskService', () => {
  let service: AskService;
  let qdrantService: QdrantService;
  let openaiService: OpenaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        AskService,
        {
          provide: QdrantService,
          useValue: {
            search: jest.fn().mockResolvedValue([{ payload: { chunk: 'context', source: 'source' } }]),
          },
        },
        {
          provide: OpenaiService,
          useValue: {
            getEmbeddingForText: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
            generateAnswer: jest.fn().mockResolvedValue({ answer: 'answer', sources: ['source'], threadId: 'threadId' }),
          },
        },
      ],
    }).compile();

    service = module.get<AskService>(AskService);
    qdrantService = module.get<QdrantService>(QdrantService);
    openaiService = module.get<OpenaiService>(OpenaiService);
  });

  it('should return an answer and sources', async () => {
    const result = await service.askQuestion('What is NestJS?');
    expect(result).toEqual({ answer: 'answer', sources: ['source'], threadId: 'threadId' });
  });

  it('should call getEmbeddingForText with the correct question', async () => {
    const question = 'What is NestJS?';
    await service.askQuestion(question);
    expect(openaiService.getEmbeddingForText).toHaveBeenCalledWith(question);
  });

  it('should call search with the correct embedding', async () => {
    const embedding = [0.1, 0.2, 0.3];
    await service.askQuestion('What is NestJS?');
    expect(qdrantService.search).toHaveBeenCalledWith(embedding);
  });

});
