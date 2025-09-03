// Winston implementation example
// Winston is now the default implementation - you can use either import style
import { createLogger, IContextLogger } from '@bussin/context-logger';
// Or explicitly: import { createLogger } from '@bussin/context-logger/winston';

const run = async () => {
  // Winston logger with rich formatting and transport options
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
