import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  serializers: {
    req(request) {
      return {
        method: request.method,
        url: request.url,
        id: request.id,
      };
    },
    res(response) {
      return {
        statusCode: response.statusCode,
      };
    },
  },
});
