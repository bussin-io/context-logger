import { createLogger, logger } from '../../src/index';
import { createLogger as createConsoleLogger } from '../../src/console/index';
import { createLogger as createWinstonLogger } from '../../src/winston/index';
import type { IContextLogger, ContextOptions, LogMethod } from '../../src/core/index';

describe('Package Exports Integration Tests', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Main package exports', () => {
    it('should export default winston implementation', () => {
      expect(createLogger).toBeDefined();
      expect(logger).toBeDefined();
      expect(typeof createLogger).toBe('function');
    });

    it('should create winston logger by default', () => {
      const defaultLogger = createLogger();
      expect(defaultLogger).toBeDefined();
      expect(typeof defaultLogger.addContext).toBe('function');
      expect(typeof defaultLogger.getContext).toBe('function');
    });

    it('should provide pre-configured default logger instance', async () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.addContext).toBe('function');
      
      const context = { test: 'default-logger' };
      const result = await logger.addContext(context, async () => {
        return 'default-logger-works';
      });
      
      expect(result).toBe('default-logger-works');
    });
  });

  describe('Console module exports', () => {
    it('should export console-specific logger factory', () => {
      expect(createConsoleLogger).toBeDefined();
      expect(typeof createConsoleLogger).toBe('function');
    });

    it('should create functional console logger', async () => {
      const consoleLogger = createConsoleLogger();
      
      const context = { module: 'console', requestId: 'test-123' };
      
      await consoleLogger.addContext(context, async () => {
        consoleLogger.info('Console logger test message');
        const currentContext = consoleLogger.getContext();
        expect(currentContext).toEqual(context);
      });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Console logger test message')
      );
    });
  });

  describe('Winston module exports', () => {
    it('should export winston-specific logger factory', () => {
      expect(createWinstonLogger).toBeDefined();
      expect(typeof createWinstonLogger).toBe('function');
    });

    it('should create functional winston logger', async () => {
      const winstonLogger = createWinstonLogger();
      
      const context = { module: 'winston', requestId: 'test-456' };
      
      const result = await winstonLogger.addContext(context, async () => {
        winstonLogger.info('Winston logger test message');
        return 'winston-test-success';
      });
      
      expect(result).toBe('winston-test-success');
    });
  });

  describe('Core module exports', () => {
    it('should allow type-safe usage of core interfaces', () => {
      const mockLogger: IContextLogger = {
        addContext: jest.fn(),
        getContext: jest.fn(),
        error: jest.fn() as LogMethod,
        warn: jest.fn() as LogMethod,
        help: jest.fn() as LogMethod,
        data: jest.fn() as LogMethod,
        info: jest.fn() as LogMethod,
        debug: jest.fn() as LogMethod,
        prompt: jest.fn() as LogMethod,
        http: jest.fn() as LogMethod,
        verbose: jest.fn() as LogMethod,
        input: jest.fn() as LogMethod,
        silly: jest.fn() as LogMethod,
      };

      const options: ContextOptions = { preserveParentContext: true };
      
      expect(mockLogger).toBeDefined();
      expect(options.preserveParentContext).toBe(true);
    });
  });

  describe('Cross-module compatibility', () => {
    it('should allow mixing different logger implementations', async () => {
      const consoleLogger = createConsoleLogger();
      const winstonLogger = createWinstonLogger();
      const defaultLogger = createLogger();

      const consoleContext = { logger: 'console' };
      const winstonContext = { logger: 'winston' };
      const defaultContext = { logger: 'default' };

      const results = await Promise.all([
        consoleLogger.addContext(consoleContext, async () => {
          consoleLogger.info('Console message');
          return 'console-result';
        }),
        winstonLogger.addContext(winstonContext, async () => {
          winstonLogger.info('Winston message');
          return 'winston-result';
        }),
        defaultLogger.addContext(defaultContext, async () => {
          defaultLogger.info('Default message');
          return 'default-result';
        })
      ]);

      expect(results).toEqual(['console-result', 'winston-result', 'default-result']);
    });

    it('should maintain type compatibility across modules', () => {
      const consoleLogger: IContextLogger = createConsoleLogger();
      const winstonLogger: IContextLogger = createWinstonLogger();
      const defaultLogger: IContextLogger = createLogger();

      // All should implement the same interface
      const loggers = [consoleLogger, winstonLogger, defaultLogger];
      
      loggers.forEach(logger => {
        expect(typeof logger.addContext).toBe('function');
        expect(typeof logger.getContext).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
      });
    });
  });

  describe('Real-world usage patterns', () => {
    it('should support factory pattern with different configurations', async () => {
      const prodLogger = createConsoleLogger({ level: 'warn', includeTimestamp: true });
      const devLogger = createConsoleLogger({ level: 'debug', includeContext: true });
      
      const context = { env: 'test', operation: 'user-login' };

      // Production logger should not log debug messages
      await prodLogger.addContext(context, async () => {
        prodLogger.debug('Debug message'); // Should not appear
        prodLogger.warn('Warning message'); // Should appear
      });

      // Development logger should log debug messages  
      await devLogger.addContext(context, async () => {
        devLogger.debug('Debug message'); // Should appear
        devLogger.info('Info message'); // Should appear
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1); // devLogger info call
    });

    it('should support dependency injection pattern', async () => {
      class UserService {
        constructor(private logger: IContextLogger) {}

        async getUser(userId: string) {
          return this.logger.addContext({ userId, service: 'UserService' }, async () => {
            this.logger.info('Fetching user data');
            
            // Simulate data fetching
            await new Promise(resolve => setTimeout(resolve, 10));
            
            this.logger.info('User data retrieved successfully');
            return { id: userId, name: 'John Doe' };
          });
        }
      }

      const logger = createConsoleLogger();
      const userService = new UserService(logger);
      
      const user = await userService.getUser('123');
      
      expect(user).toEqual({ id: '123', name: 'John Doe' });
      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    });

    it('should support middleware pattern with context enhancement', async () => {
      const baseLogger = createConsoleLogger();
      
      const withRequestId = (requestId: string) => (
        async <T>(operation: () => Promise<T>): Promise<T> => {
          return baseLogger.addContext({ requestId }, operation);
        }
      );

      const withUserId = (userId: string) => (
        async <T>(operation: () => Promise<T>): Promise<T> => {
          return baseLogger.addContext({ userId }, operation);
        }
      );

      const result = await withRequestId('req-123')(
        async () => await withUserId('user-456')(
          async () => {
            baseLogger.info('Processing user request');
            const context = baseLogger.getContext();
            expect(context).toEqual({ requestId: 'req-123', userId: 'user-456' });
            return 'middleware-success';
          }
        )
      );

      expect(result).toBe('middleware-success');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling across modules', () => {
    it('should handle errors consistently across all logger types', async () => {
      const loggers = [
        createConsoleLogger(),
        createWinstonLogger(),
        createLogger()
      ];

      const testError = new Error('Test error for all loggers');

      for (const logger of loggers) {
        await expect(
          logger.addContext({ test: 'error-handling' }, async () => {
            throw testError;
          })
        ).rejects.toThrow('Test error for all loggers');
      }
    });

    it('should log errors with context information', async () => {
      const logger = createConsoleLogger();
      const errorContext = { operation: 'test-error', userId: '123' };
      
      try {
        await logger.addContext(errorContext, async () => {
          logger.error('Something went wrong', { errorCode: 'TEST_001' });
          throw new Error('Test error');
        });
      } catch (error: any) {
        expect(error.message).toBe('Test error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Something went wrong')
      );
    });
  });
});