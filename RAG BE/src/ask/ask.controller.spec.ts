import { Test, TestingModule } from '@nestjs/testing';
import { AskController } from './ask.controller';
import { AskService } from './ask.service';
import { threadId } from 'worker_threads';

describe('AskController', () => {
  let controller: AskController;
  let service: AskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AskController],
      providers: [
        {
          provide: AskService,
          useValue: {
            askQuestion: jest.fn().mockResolvedValue({ answer: 'answer', sources: ['source'], threadId: 'threadId' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AskController>(AskController);
    service = module.get<AskService>(AskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an answer and sources', async () => {
    const result = await controller.askQuestion('What is NestJS?');
    expect(result).toEqual({ answer: 'answer', sources: ['source'], threadId: 'threadId' });
  });
});
