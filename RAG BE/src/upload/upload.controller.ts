import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UploadedFiles, Logger } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  private readonly logger = new Logger(UploadController.name);
  
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async uploadFiles(@UploadedFiles() files: { files: Express.Multer.File[] }) {
    const { files: uploadedFiles } = files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const acceptedFiles = [];
    const rejectedFiles = [];

    for (const file of uploadedFiles) {
      try {
        if (file.mimetype === 'application/pdf') {
          await this.uploadService.parseAndEmbedPDF(file.buffer, file.originalname);
          acceptedFiles.push(file.originalname);
        } else if (file.mimetype === 'text/plain') {
          await this.uploadService.parseAndEmbedText(file.buffer, file.originalname);
          acceptedFiles.push(file.originalname);
        } else {
          rejectedFiles.push({ name: file.originalname, reason: 'Unsupported file type' });
        }
      } catch (error) {
        this.logger.error(`Error processing file: ${file.originalname}`, error);
        rejectedFiles.push({ name: file.originalname, reason: error?.message ?? error?.toString() });
      }
    }

    return { acceptedFiles, rejectedFiles };
  }
}
