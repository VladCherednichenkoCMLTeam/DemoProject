import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: Logger;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    logger = new Logger(AllExceptionsFilter.name);
  });

  it('should log and respond with the correct status and message for HttpException', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: '/test' };
    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Forbidden', 403);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 403,
      timestamp: expect.any(String),
      path: '/test',
      message: 'Forbidden',
    });
  });

  it('should log and respond with 500 for unknown exceptions', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = { url: '/test' };
    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new Error('Unknown error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      timestamp: expect.any(String),
      path: '/test',
      message: 'Unknown error',
    });
  });
}); 