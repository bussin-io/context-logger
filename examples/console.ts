// Console implementation example
// Note: Winston is now the default implementation
import { IContextLogger } from '@bussin/context-logger';
import { createLogger } from '@bussin/context-logger/console';

const run = async () => {
  // Console logger outputs structured JSON logs
  const logger: IContextLogger = createLogger({ level: 'debug' });

  logger.info('info log message', { meta: 'abc' });

  await logger.addContext({ traceId: 123 }, async () => {
    logger.info('info log message with context', { meta: 'def' });

    try {
      throw new Error('test error');
    } catch (error) {
      logger.error(error, { meta: 'ghi' });
    }
  });

  logger.warn('warn log message, no context');

  logger.debug('debug log message, no context');
};

run();
