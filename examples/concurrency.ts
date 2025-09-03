// Concurrency example with context isolation
// Uses the default winston implementation
import { logger } from '@bussin/context-logger';

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const doAsyncJob = async () => {
  logger.info('start job');

  await sleep(1_000);
  logger.info('sleep complete', { ms: 1_000 });

  await sleep(2_000);
  logger.info('sleep complete', { ms: 2_000 });

  await sleep(3_000);
  logger.info('sleep complete', { ms: 3_000 });

  logger.info('job complete');
};

// start multiple jobs wrapped with logger context.
// logs in each job will retain context info (id).
Promise.all([
  logger.addContext({ id: 1 }, doAsyncJob),
  logger.addContext({ id: 2 }, doAsyncJob),
  logger.addContext({ id: 3 }, doAsyncJob),
]);
