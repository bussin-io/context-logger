import { createLogger } from '../../src/console/createLogger';
import { IContextLogger } from '../../src/core/IContextLogger';

describe('Async Context Integration Tests', () => {
  let logger: IContextLogger;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = createLogger();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('AsyncLocalStorage integration', () => {
    it('should maintain context across async operations', async () => {
      const context = { requestId: 'async-123', userId: 'user-456' };

      await logger.addContext(context, async () => {
        // Immediate context check
        expect(logger.getContext()).toEqual(context);

        // After timeout
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(logger.getContext()).toEqual(context);

        // After Promise.resolve
        await Promise.resolve();
        expect(logger.getContext()).toEqual(context);

        // After multiple async operations
        await Promise.all([
          Promise.resolve(1),
          Promise.resolve(2),
          new Promise(resolve => setTimeout(resolve, 5))
        ]);
        expect(logger.getContext()).toEqual(context);
      });
    });

    it('should maintain context across Promise chains', async () => {
      const context = { chainTest: true, step: 0 };

      const result = await logger.addContext(context, async () => {
        return Promise.resolve(1)
          .then(val => {
            expect(logger.getContext()).toEqual(context);
            return val + 1;
          })
          .then(val => {
            expect(logger.getContext()).toEqual(context);
            return val + 1;
          })
          .then(async val => {
            await new Promise(resolve => setTimeout(resolve, 5));
            expect(logger.getContext()).toEqual(context);
            return val + 1;
          });
      });

      expect(result).toBe(4);
    });

    it('should isolate contexts between concurrent operations', async () => {
      const contexts = [
        { operation: 'op1', id: 1 },
        { operation: 'op2', id: 2 },
        { operation: 'op3', id: 3 }
      ];

      const simulateOperation = async (ctx: object, delay: number) => {
        return logger.addContext(ctx, async () => {
          await new Promise(resolve => setTimeout(resolve, delay));
          
          const currentContext = logger.getContext();
          logger.info('Operation executing', { context: currentContext });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return currentContext;
        });
      };

      const results = await Promise.all([
        simulateOperation(contexts[0], 30),
        simulateOperation(contexts[1], 20),
        simulateOperation(contexts[2], 40)
      ]);

      // Each operation should have maintained its own context
      expect(results[0]).toEqual(contexts[0]);
      expect(results[1]).toEqual(contexts[1]);
      expect(results[2]).toEqual(contexts[2]);

      // All operations should have logged
      expect(consoleInfoSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Context inheritance and nesting', () => {
    it('should properly inherit parent context by default', async () => {
      const parentContext = { level: 1, parent: true };
      const childContext = { level: 2, child: true };

      await logger.addContext(parentContext, async () => {
        await logger.addContext(childContext, async () => {
          const currentContext = logger.getContext();
          expect(currentContext).toEqual({
            level: 2,  // child overwrites parent
            parent: true,
            child: true
          });
        });
      });
    });

    it('should preserve parent context when specified', async () => {
      const parentContext = { level: 1, parent: true, shared: 'parent' };
      const childContext = { level: 2, child: true, shared: 'child' };

      await logger.addContext(parentContext, async () => {
        await logger.addContext(childContext, { preserveParentContext: true }, async () => {
          const currentContext = logger.getContext();
          expect(currentContext).toEqual({
            level: 1,  // parent preserved over child
            parent: true,
            child: true,
            shared: 'parent'  // parent value preserved
          });
        });
      });
    });

    it('should handle deeply nested contexts', async () => {
      const buildNestedContext = async (depth: number, currentDepth = 0): Promise<any> => {
        const context = { depth: currentDepth, value: `level-${currentDepth}` };
        
        if (currentDepth >= depth) {
          return logger.getContext();
        }

        return logger.addContext(context, async () => {
          return buildNestedContext(depth, currentDepth + 1);
        });
      };

      const finalContext = await logger.addContext({ root: true }, async () => {
        return buildNestedContext(2);
      });

      expect(finalContext).toEqual({
        root: true,
        depth: 1,
        value: 'level-1'
      });
    });
  });

  describe('Error propagation with context', () => {
    it('should propagate errors while maintaining context integrity', async () => {
      const context = { errorTest: true, requestId: 'error-123' };

      try {
        await logger.addContext(context, async () => {
          expect(logger.getContext()).toEqual(context);
          
          await new Promise(resolve => setTimeout(resolve, 10));
          expect(logger.getContext()).toEqual(context);
          
          throw new Error('Test error');
        });
      } catch (error: any) {
        expect(error.message).toBe('Test error');
        // Context should be cleared after error
        expect(logger.getContext()).toBeUndefined();
      }
    });

    it('should handle errors in nested contexts', async () => {
      const parentContext = { level: 'parent' };
      const childContext = { level: 'child' };

      try {
        await logger.addContext(parentContext, async () => {
          expect(logger.getContext()).toEqual(parentContext);
          
          await logger.addContext(childContext, async () => {
            expect(logger.getContext()).toEqual({
              level: 'child'
            });
            
            throw new Error('Nested error');
          });
        });
      } catch (error: any) {
        expect(error.message).toBe('Nested error');
        expect(logger.getContext()).toBeUndefined();
      }
    });
  });

  describe('Context with various async patterns', () => {
    it('should work with async/await pattern', async () => {
      const context = { pattern: 'async-await' };

      const result = await logger.addContext(context, async () => {
        const step1 = await Promise.resolve('step1');
        expect(logger.getContext()).toEqual(context);

        const step2 = await new Promise(resolve => 
          setTimeout(() => resolve('step2'), 10)
        );
        expect(logger.getContext()).toEqual(context);

        return `${step1}-${step2}`;
      });

      expect(result).toBe('step1-step2');
    });

    it('should work with callback-style APIs wrapped in promises', async () => {
      const context = { pattern: 'callback-wrapper' };

      const callbackAsPromise = () => new Promise((resolve) => {
        setTimeout(() => {
          expect(logger.getContext()).toEqual(context);
          resolve('callback-result');
        }, 15);
      });

      await logger.addContext(context, async () => {
        const result = await callbackAsPromise();
        expect(result).toBe('callback-result');
      });
    });

    it('should work with generator functions', async () => {
      const context = { pattern: 'generator' };

      function* dataGenerator() {
        yield 1;
        yield 2;
        yield 3;
      }

      await logger.addContext(context, async () => {
        const generator = dataGenerator();
        const values = [];
        
        for (const value of generator) {
          await new Promise(resolve => setTimeout(resolve, 5));
          expect(logger.getContext()).toEqual(context);
          values.push(value);
        }
        
        expect(values).toEqual([1, 2, 3]);
      });
    });
  });

  describe('Context with external async libraries simulation', () => {
    it('should maintain context through simulated database operations', async () => {
      const context = { operation: 'db-query', table: 'users' };

      // Simulate database query
      const mockDbQuery = async (query: string, params: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(logger.getContext()).toEqual(context);
        return { rows: [{ id: 1, name: 'John' }], query, params };
      };

      await logger.addContext(context, async () => {
        const result = await mockDbQuery('SELECT * FROM users WHERE id = ?', [1]);
        
        logger.info('Database query completed', { 
          rowCount: result.rows.length,
          query: result.query
        });

        expect(result.rows).toHaveLength(1);
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should maintain context through simulated HTTP requests', async () => {
      const context = { operation: 'http-request', endpoint: '/api/users' };

      // Simulate HTTP request
      const mockHttpRequest = async (url: string, options: any) => {
        await new Promise(resolve => setTimeout(resolve, 25));
        expect(logger.getContext()).toEqual(context);
        return { 
          status: 200, 
          data: { users: [] },
          url,
          method: options.method 
        };
      };

      await logger.addContext(context, async () => {
        const response = await mockHttpRequest('/api/users', { method: 'GET' });
        
        logger.info('HTTP request completed', {
          status: response.status,
          method: response.method
        });

        expect(response.status).toBe(200);
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });
});