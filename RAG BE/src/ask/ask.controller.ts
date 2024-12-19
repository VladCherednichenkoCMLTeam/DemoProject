import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AskService } from './ask.service';

@Controller('ask')
export class AskController {
  private readonly logger = new Logger(AskController.name);

  constructor(private readonly askService: AskService) {}

  @Post()
  async askQuestion(@Body('question') question: string, @Body('threadId') threadId?: string): Promise<{ answer: string, sources: string[], threadId: string }> {
    this.logger.log(`Question asked: ${question}`);
    return this.askService.askQuestion(question, threadId);
  }

  @Post('/suggestions')
  async getSuggestions(@Body('question') question: string, @Body('answer') answer: string): Promise<string[]> {
    this.logger.log(`Suggestions asked for: ${question}`);
    return this.askService.getSuggestionForClient(question, answer);
  }
}
