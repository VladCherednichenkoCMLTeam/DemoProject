import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { AskService } from '../ask.service';
import OpenAI, { OpenAIError } from 'openai';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: (origin, cb) => {
      if (origin == undefined || origin.includes(process.env.BASE_URL) || origin.includes('localhost')) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed'), false);
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true
  }
})
export class AskGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AskGateway.name);

  constructor(
    private readonly askService: AskService,
  ) {

  }
  @WebSocketServer()
  namespace: Namespace;

  afterInit(namespace: Namespace) {
    this.logger.log('WebSocket server initialized', namespace.name);
  }

  async handleConnection(client: Socket /*, ...args: any[]*/) {
    client.setMaxListeners(0);

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('askQuestion')
  handleMessageChat(
    @MessageBody() data: { question: string; threadId: string },
    @ConnectedSocket() client: Socket
  ) {
    const onDelta = (textDelta: OpenAI.Beta.Threads.Messages.TextDelta, threadId: string, sources: string[]) => {
      client.emit('partMessage', { answer: textDelta.value, threadId: threadId, sources: sources});
    }
    const onEnd = (message: string) => {
      client.emit('endMessage', message);
    }
    const onError = (error: OpenAIError, message: string) => {
      client.emit('endMessage', message);
    }
    this.askService.askQuestion(data.question, data.threadId, onDelta, onEnd, onError);
  }
}
