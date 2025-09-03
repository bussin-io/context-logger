// JavaScript usage examples (CommonJS and ESM)
// This file demonstrates usage without TypeScript

// ESM imports (if using Node.js with "type": "module" in package.json)
// import { createLogger, logger } from '@bussin/context-logger';
// import { createLogger as createConsoleLogger } from '@bussin/context-logger/console';

// CommonJS imports (traditional Node.js)
const { createLogger, logger } = require('@bussin/context-logger');
const { createLogger: createConsoleLogger } = require('@bussin/context-logger/console');
const { createLogger: createWinstonLogger } = require('@bussin/context-logger/winston');

// Example 1: Basic usage with default winston logger
async function basicExample() {
  console.log('=== Basic Usage Example ===');
  
  const myLogger = createLogger({ level: 'info' });
  
  await myLogger.addContext({ userId: 'user-123', sessionId: 'sess-456' }, async () => {
    myLogger.info('User logged in', { timestamp: new Date().toISOString() });
    
    // Nested context
    await myLogger.addContext({ action: 'view-profile' }, async () => {
      myLogger.info('User viewing profile');
      myLogger.debug('Loading user data from database');
    });
    
    myLogger.info('User session active');
  });
}

// Example 2: Console logger for development
async function consoleExample() {
  console.log('\n=== Console Logger Example ===');
  
  const consoleLogger = createConsoleLogger({
    level: 'debug',
    includeTimestamp: true,
    includeLevel: true,
    includeContext: true
  });
  
  await consoleLogger.addContext(
    { 
      service: 'user-service',
      version: '1.0.0',
      environment: 'development'
    },
    async () => {
      consoleLogger.debug('Service starting up');
      consoleLogger.info('Database connection established');
      consoleLogger.warn('Using development configuration');
    }
  );
}

// Example 3: Error handling and logging
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===');
  
  const errorLogger = createLogger({ level: 'debug' });
  
  await errorLogger.addContext({ requestId: 'req-001' }, async () => {
    try {
      errorLogger.info('Starting risky operation');
      
      // Simulate an error
      if (Math.random() > 0.5) {
        throw new Error('Something went wrong!');
      }
      
      errorLogger.info('Operation completed successfully');
    } catch (error) {
      errorLogger.error('Operation failed', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Example 4: Using singleton logger
async function singletonExample() {
  console.log('\n=== Singleton Logger Example ===');
  
  // Using the pre-configured singleton logger
  await logger.addContext({ module: 'payment-processor' }, async () => {
    logger.info('Processing payment', { amount: 99.99, currency: 'USD' });
    
    await logger.addContext({ step: 'validation' }, async () => {
      logger.debug('Validating credit card');
      logger.debug('Checking fraud rules');
    });
    
    await logger.addContext({ step: 'authorization' }, async () => {
      logger.info('Authorizing payment');
      logger.info('Payment authorized successfully');
    });
    
    logger.info('Payment processing complete');
  });
}

// Example 5: Different log levels
async function logLevelsExample() {
  console.log('\n=== Log Levels Example ===');
  
  const levelsLogger = createLogger({ level: 'silly' });
  
  await levelsLogger.addContext({ component: 'log-demo' }, async () => {
    levelsLogger.error('This is an error message');
    levelsLogger.warn('This is a warning message');  
    levelsLogger.help('This is a help message');
    levelsLogger.data('This is a data message');
    levelsLogger.info('This is an info message');
    levelsLogger.debug('This is a debug message');
    levelsLogger.prompt('This is a prompt message');
    levelsLogger.http('This is an http message');
    levelsLogger.verbose('This is a verbose message');
    levelsLogger.input('This is an input message');
    levelsLogger.silly('This is a silly message');
  });
}

// Example 6: Context inheritance and options
async function contextOptionsExample() {
  console.log('\n=== Context Options Example ===');
  
  const optionsLogger = createLogger({ level: 'info' });
  
  // Default behavior - child inherits and can override parent
  await optionsLogger.addContext({ tenant: 'acme-corp', region: 'us-east' }, async () => {
    optionsLogger.info('Parent context set');
    
    await optionsLogger.addContext({ region: 'us-west', service: 'api' }, async () => {
      // Context now has: tenant: 'acme-corp', region: 'us-west', service: 'api'
      optionsLogger.info('Child context (parent overridden)', {
        currentContext: optionsLogger.getContext()
      });
    });
  });
  
  // Preserve parent context - child values are ignored if key exists in parent
  await optionsLogger.addContext({ tenant: 'acme-corp', region: 'us-east' }, async () => {
    await optionsLogger.addContext(
      { region: 'us-west', service: 'api' },
      { preserveParentContext: true },
      async () => {
        // Context now has: tenant: 'acme-corp', region: 'us-east', service: 'api'
        optionsLogger.info('Child context (parent preserved)', {
          currentContext: optionsLogger.getContext()
        });
      }
    );
  });
}

// Example 7: Practical web service example
async function webServiceExample() {
  console.log('\n=== Web Service Example ===');
  
  const webLogger = createWinstonLogger({ level: 'info' });
  
  // Simulate handling a web request
  const handleRequest = async (req) => {
    await webLogger.addContext({
      requestId: req.id,
      method: req.method,
      path: req.path,
      userAgent: req.userAgent,
      startTime: Date.now()
    }, async (context) => {
      webLogger.info('Request received');
      
      try {
        // Simulate authentication
        await webLogger.addContext({ userId: req.userId }, async () => {
          webLogger.info('User authenticated');
          
          // Simulate business logic
          webLogger.debug('Processing business logic');
          await new Promise(resolve => setTimeout(resolve, 100));
          
          webLogger.info('Request processed successfully');
        });
        
      } catch (error) {
        webLogger.error('Request failed', { error: error.message });
      } finally {
        const duration = Date.now() - context.startTime;
        webLogger.info('Request completed', { duration: `${duration}ms` });
      }
    });
  };
  
  // Simulate multiple concurrent requests
  const requests = [
    { id: 'req-001', method: 'GET', path: '/users', userAgent: 'Chrome', userId: 'user-123' },
    { id: 'req-002', method: 'POST', path: '/orders', userAgent: 'Firefox', userId: 'user-456' },
    { id: 'req-003', method: 'PUT', path: '/profile', userAgent: 'Safari', userId: 'user-789' }
  ];
  
  await Promise.all(requests.map(handleRequest));
}

// Run all examples
async function runAllExamples() {
  await basicExample();
  await consoleExample();
  await errorHandlingExample();
  await singletonExample();
  await logLevelsExample();
  await contextOptionsExample();
  await webServiceExample();
  
  console.log('\n=== All JavaScript Examples Complete ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export for use in other modules
module.exports = {
  basicExample,
  consoleExample,
  errorHandlingExample,
  singletonExample,
  logLevelsExample,
  contextOptionsExample,
  webServiceExample,
  runAllExamples
};