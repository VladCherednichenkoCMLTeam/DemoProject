import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            parseAndEmbedPDF: jest.fn(),
            parseAndEmbedText: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should throw BadRequestException if no files are uploaded', async () => {
    await expect(controller.uploadFiles({ files: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should call parseAndEmbedPDF for PDF files', async () => {
    const file = {
      buffer: Buffer.from(''),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      fieldname: 'files',
      encoding: '7bit',
      size: 1234,
      stream: null,
      destination: '',
      filename: '',
      path: '',
    };
    await controller.uploadFiles({ files: [file] });

    expect(service.parseAndEmbedPDF).toHaveBeenCalledWith(file.buffer, file.originalname);
  });

  it('should call parseAndEmbedText for text files', async () => {
    const file = {
      buffer: Buffer.from(''),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      fieldname: 'files',
      encoding: '7bit',
      size: 1234,
      stream: null,
      destination: '',
      filename: '',
      path: '',
    };
    await controller.uploadFiles({ files: [file] });

    expect(service.parseAndEmbedText).toHaveBeenCalledWith(file.buffer, file.originalname);
  });
});
