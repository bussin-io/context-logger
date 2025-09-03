import { ConsoleContextLogger } from '../../src/console/ConsoleContextLogger';
import { WinstonContextLogger } from '../../src/winston/WinstonContextLogger';
import { createLogger as createConsoleLogger } from '../../src/console/createLogger';
import { createLogger as createWinstonLogger } from '../../src/winston/createLogger';
import { IContextLogger } from '../../src/core/IContextLogger';

describe('Console and Winston Integration Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Cross-platform logger behavior', () => {
    let consoleLogger: IContextLogger;
    let winstonLogger: IContextLogger;

    beforeEach(() => {
      consoleLogger = createConsoleLogger();
      winstonLogger = createWinstonLogger();
    });

    it('should have consistent interface between console and winston loggers', () => {
      const expectedMethods = [
        'addContext', 'getContext', 'error', 'warn', 'info', 'debug'
      ];

      expectedMethods.forEach(method => {
        expect(typeof (consoleLogger as any)[method]).toBe('function');
        expect(typeof (winstonLogger as any)[method]).toBe('function');
      });
    });

    it('should handle context consistently across implementations', async () => {
      const context = { userId: '123', requestId: 'abc-456' };
      let consoleResult: string;
      let winstonResult: string;

      // Test console logger
      consoleResult = await consoleLogger.addContext(context, async (ctx) => {
        expect(ctx).toEqual(context);
        return 'console-success';
      });

      // Test winston logger  
      winstonResult = await winstonLogger.addContext(context, async (ctx) => {
        expect(ctx).toEqual(context);
        return 'winston-success';
      });

      expect(consoleResult).toBe('console-success');
      expect(winstonResult).toBe('winston-success');
    });

    it('should maintain context isolation between loggers', async () => {
      const consoleContext = { source: 'console', requestId: '123' };
      const winstonContext = { source: 'winston', requestId: '456' };

      await Promise.all([
        consoleLogger.addContext(consoleContext, async () => {
          const ctx = consoleLogger.getContext();
          expect(ctx).toEqual(consoleContext);
        }),
        winstonLogger.addContext(winstonContext, async () => {
          const ctx = winstonLogger.getContext();
          expect(ctx).toEqual(winstonContext);
        })
      ]);
    });
  });

  describe('Real-world usage scenarios', () => {
    let logger: IContextLogger;

    beforeEach(() => {
      logger = createConsoleLogger();
    });

    it('should handle concurrent requests with different contexts', async () => {
      const user1Context = { userId: '1', sessionId: 's1' };
      const user2Context = { userId: '2', sessionId: 's2' };
      const user3Context = { userId: '3', sessionId: 's3' };

      const simulateRequest = async (userContext: object, delay: number) => {
        return logger.addContext(userContext, async (ctx) => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Log within context
          logger.info('Processing request', { step: 'validation' });
          
          // Simulate more async work
          await new Promise(resolve => setTimeout(resolve, delay));
          
          logger.info('Request completed', { step: 'completion' });
          
          return ctx;
        });
      };

      const results = await Promise.all([
        simulateRequest(user1Context, 50),
        simulateRequest(user2Context, 30),
        simulateRequest(user3Context, 40),
      ]);

      // Verify contexts were maintained correctly
      expect(results[0]).toEqual(user1Context);
      expect(results[1]).toEqual(user2Context);
      expect(results[2]).toEqual(user3Context);

      // Verify all log calls were made
      expect(consoleInfoSpy).toHaveBeenCalledTimes(6); // 2 calls per request, 3 requests
    });

    it('should handle nested service calls with context inheritance', async () => {
      const requestContext = { requestId: 'req-123', userId: '456' };
      const serviceContext = { service: 'userService', operation: 'getUser' };
      const dbContext = { connection: 'primary', query: 'SELECT * FROM users' };

      const result = await logger.addContext(requestContext, async () => {
        logger.info('Starting request processing');

        return logger.addContext(serviceContext, async () => {
          logger.info('Calling user service');

          return logger.addContext(dbContext, async () => {
            logger.info('Executing database query');
            
            const currentContext = logger.getContext();
            expect(currentContext).toEqual({
              ...requestContext,
              ...serviceContext,
              ...dbContext
            });

            return 'user-data';
          });
        });
      });

      expect(result).toBe('user-data');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle error scenarios within context', async () => {
      const context = { operation: 'test', requestId: '123' };

      await expect(
        logger.addContext(context, async () => {
          logger.info('Starting operation');
          throw new Error('Operation failed');
        })
      ).rejects.toThrow('Operation failed');

      // Verify log was called before error
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and memory considerations', () => {
    let logger: IContextLogger;

    beforeEach(() => {
      logger = createConsoleLogger();
    });

    it('should handle many nested contexts without memory leaks', async () => {
      const createNestedContexts = async (depth: number, currentDepth = 0): Promise<string> => {
        if (currentDepth >= depth) {
          return `depth-${currentDepth}`;
        }

        return logger.addContext(
          { level: currentDepth, timestamp: Date.now() },
          async () => {
            return createNestedContexts(depth, currentDepth + 1);
          }
        );
      };

      const result = await createNestedContexts(50);
      expect(result).toBe('depth-50');
    });

    it('should handle rapid context switching', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => i);
      
      const results = await Promise.all(
        operations.map(i =>
          logger.addContext({ operationId: i }, async (ctx) => {
            return ctx.operationId;
          })
        )
      );

      expect(results).toEqual(operations);
    });
  });

  describe('Mixed logger usage in same application', () => {
    it('should allow using both console and winston loggers simultaneously', async () => {
      const consoleLogger = createConsoleLogger();
      const winstonLogger = createWinstonLogger();

      const consoleContext = { logger: 'console' };
      const winstonContext = { logger: 'winston' };

      // Use both loggers concurrently
      const [consoleResult, winstonResult] = await Promise.all([
        consoleLogger.addContext(consoleContext, async (ctx) => {
          consoleLogger.info('Console logger message');
          return `console-${ctx.logger}`;
        }),
        winstonLogger.addContext(winstonContext, async (ctx) => {
          winstonLogger.info('Winston logger message');
          return `winston-${ctx.logger}`;
        })
      ]);

      expect(consoleResult).toBe('console-console');
      expect(winstonResult).toBe('winston-winston');

      // Verify no cross-contamination
      expect(consoleLogger.getContext()).toBeUndefined();
      expect(winstonLogger.getContext()).toBeUndefined();
    });
  });

  describe('Edge cases and error handling', () => {
    let logger: IContextLogger;

    beforeEach(() => {
      logger = createConsoleLogger();
    });

    it('should handle empty context objects', async () => {
      const result = await logger.addContext({}, async () => {
        logger.info('Empty context test');
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should handle null and undefined values in context', async () => {
      const context = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroNumber: 0,
        falseBoolean: false
      };

      const result = await logger.addContext(context, async (ctx) => {
        expect(ctx.nullValue).toBeNull();
        expect(ctx.undefinedValue).toBeUndefined();
        expect(ctx.emptyString).toBe('');
        expect(ctx.zeroNumber).toBe(0);
        expect(ctx.falseBoolean).toBe(false);
        return 'handled-edge-values';
      });

      expect(result).toBe('handled-edge-values');
    });

    it('should handle complex nested objects in context', async () => {
      const complexContext = {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              language: 'en'
            }
          }
        },
        request: {
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-client'
          }
        }
      };

      const result = await logger.addContext(complexContext, async (ctx) => {
        expect(ctx.user.profile.name).toBe('John Doe');
        expect(ctx.request.headers['content-type']).toBe('application/json');
        return 'complex-context-handled';
      });

      expect(result).toBe('complex-context-handled');
    });
  });
});