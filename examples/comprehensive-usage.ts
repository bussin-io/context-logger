// Comprehensive usage example demonstrating all features
// This example shows winston (default), console, and core functionality
import { createLogger, logger, IContextLogger } from '@bussin/context-logger';
import { createLogger as createConsoleLogger } from '@bussin/context-logger/console';
import { createLogger as createWinstonLogger } from '@bussin/context-logger/winston';

// Example 1: Using the default winston implementation
console.log('=== Example 1: Default Winston Implementation ===');

const defaultLogger = createLogger({ level: 'debug' });
await defaultLogger.addContext({ requestId: 'req-001', userId: 'user-123' }, async () => {
  defaultLogger.info('Processing user request', { action: 'getData' });
  
  // Nested context - inherits parent context
  await defaultLogger.addContext({ operation: 'database-query' }, async () => {
    defaultLogger.debug('Executing SQL query', { table: 'users' });
    defaultLogger.info('Query completed', { rows: 42, duration: '15ms' });
  });
  
  defaultLogger.info('Request completed', { status: 'success' });
});

// Example 2: Using the singleton logger
console.log('\n=== Example 2: Singleton Logger ===');

await logger.addContext({ sessionId: 'sess-456' }, async () => {
  logger.info('Session started');
  
  try {
    throw new Error('Simulated error');
  } catch (error) {
    logger.error('An error occurred', { error: error.message, stack: error.stack });
  }
  
  logger.warn('Session cleanup needed', { reason: 'error-occurred' });
});

// Example 3: Console implementation for structured JSON output
console.log('\n=== Example 3: Console Implementation ===');

const consoleLogger = createConsoleLogger({ 
  level: 'info',
  includeTimestamp: true,
  includeLevel: true,
  includeContext: true
});

await consoleLogger.addContext({ service: 'api-gateway', version: '1.2.3' }, async () => {
  consoleLogger.info('Service starting', { port: 3000 });
  consoleLogger.warn('High memory usage detected', { usage: '85%' });
});

// Example 4: Winston with custom configuration
console.log('\n=== Example 4: Winston with Custom Config ===');

const customWinstonLogger = createWinstonLogger({
  level: 'verbose',
  format: require('winston').format.combine(
    require('winston').format.timestamp(),
    require('winston').format.errors({ stack: true }),
    require('winston').format.json()
  )
});

await customWinstonLogger.addContext({ 
  correlationId: 'corr-789',
  component: 'payment-processor' 
}, async () => {
  customWinstonLogger.verbose('Payment processing started');
  customWinstonLogger.info('Validating payment method', { method: 'credit-card' });
  customWinstonLogger.info('Payment authorized', { amount: 99.99, currency: 'USD' });
  customWinstonLogger.verbose('Payment processing completed');
});

// Example 5: All log levels
console.log('\n=== Example 5: All Log Levels ===');

const levelLogger = createLogger({ level: 'silly' });
await levelLogger.addContext({ feature: 'log-levels-demo' }, async () => {
  levelLogger.error('Error message');
  levelLogger.warn('Warning message');
  levelLogger.help('Help message');
  levelLogger.data('Data message');
  levelLogger.info('Info message');
  levelLogger.debug('Debug message');  
  levelLogger.prompt('Prompt message');
  levelLogger.http('HTTP message');
  levelLogger.verbose('Verbose message');
  levelLogger.input('Input message');
  levelLogger.silly('Silly message');
});

// Example 6: Context options
console.log('\n=== Example 6: Context Options ===');

const optionsLogger = createLogger({ level: 'info' });

// Default behavior: child context inherits from parent
await optionsLogger.addContext({ parentKey: 'parent-value' }, async () => {
  optionsLogger.info('Parent context');
  
  await optionsLogger.addContext({ childKey: 'child-value' }, async () => {
    // This will have both parentKey and childKey
    optionsLogger.info('Child context (inherited)');
  });
});

// Preserve parent context: child overrides parent
await optionsLogger.addContext({ key: 'parent-value' }, async () => {
  optionsLogger.info('Parent context');
  
  await optionsLogger.addContext(
    { key: 'child-value' }, 
    { preserveParentContext: true },
    async () => {
      // This will have key = 'parent-value' (parent preserved)
      optionsLogger.info('Child context (parent preserved)');
    }
  );
});

// Example 7: Getting current context
console.log('\n=== Example 7: Getting Current Context ===');

const contextLogger = createLogger({ level: 'info' });
await contextLogger.addContext({ traceId: 'trace-001', spanId: 'span-001' }, async () => {
  const currentContext = contextLogger.getContext();
  contextLogger.info('Current context retrieved', { context: currentContext });
  
  // Modify context based on current state
  await contextLogger.addContext(
    { ...currentContext, operation: 'context-demo', step: 1 }, 
    async () => {
      contextLogger.info('Enhanced context', { 
        context: contextLogger.getContext() 
      });
    }
  );
});

console.log('\n=== All Examples Complete ===');