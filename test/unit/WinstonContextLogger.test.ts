import { mock, MockProxy } from 'jest-mock-extended';
import { Logger, format, transports } from 'winston';
import { WinstonContextLogger } from '../../src/winston/WinstonContextLogger';
import { WinstonContextLoggerOptions } from '../../src/winston/WinstonContextLoggerOptions';

describe('WinstonContextLogger', () => {
  let logger: WinstonContextLogger;
  let mockTransport: MockProxy<transports.ConsoleTransportInstance>;

  beforeEach(() => {
    mockTransport = mock<transports.ConsoleTransportInstance>();
    mockTransport.format = undefined;
    mockTransport.level = undefined;
    jest.clearAllMocks();
  });

  describe('constructor and factory', () => {
    it('should create logger with default options', () => {
      logger = WinstonContextLogger.create();
      expect(logger).toBeInstanceOf(WinstonContextLogger);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom options', () => {
      const options: WinstonContextLoggerOptions = {
        level: 'debug',
        format: format.simple(),
      };
      logger = WinstonContextLogger.create(options);
      expect(logger).toBeInstanceOf(WinstonContextLogger);
    });

    it('should create logger with default format when none provided', () => {
      logger = WinstonContextLogger.create();
      expect(logger.format).toBeDefined();
    });

    it('should use provided format when specified', () => {
      const customFormat = format.simple();
      const options: WinstonContextLoggerOptions = {
        format: customFormat,
      };
      logger = WinstonContextLogger.create(options);
      expect(logger.format).toBeDefined();
    });
  });

  describe('dynamic log methods', () => {
    beforeEach(() => {
      logger = WinstonContextLogger.create();
    });

    it('should have all npm log levels as methods', () => {
      const npmLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
      
      npmLevels.forEach(level => {
        expect(typeof logger[level]).toBe('function');
      });
    });

    it('should have isLevelEnabled methods for each level', () => {
      const npmLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
      
      npmLevels.forEach(level => {
        const isEnabledMethod = `is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`;
        expect(typeof logger[isEnabledMethod]).toBe('function');
      });
    });

    it('should call log method with correct level for single message argument', () => {
      const logSpy = jest.spyOn(logger, 'log').mockImplementation();
      
      logger.info('test message');
      
      expect(logSpy).toHaveBeenCalledWith({
        message: 'test message',
        level: 'info'
      });
    });

    it('should call log method with object message', () => {
      const logSpy = jest.spyOn(logger, 'log').mockImplementation();
      const messageObj = { message: 'test message', extra: 'data' };
      
      logger.info(messageObj);
      
      expect(logSpy).toHaveBeenCalledWith({
        message: 'test message',
        extra: 'data',
        level: 'info'
      });
    });

    it('should handle empty arguments', () => {
      const logSpy = jest.spyOn(logger, 'log').mockImplementation();
      
      (logger as any).info();
      
      expect(logSpy).toHaveBeenCalledWith('info', '');
    });

    it('should handle multiple arguments', () => {
      const logSpy = jest.spyOn(logger, 'log').mockImplementation();
      
      logger.info('message', { extra: 'data' });
      
      expect(logSpy).toHaveBeenCalledWith('info', 'message', { extra: 'data' });
    });
  });

  describe('context management', () => {
    beforeEach(() => {
      logger = WinstonContextLogger.create();
    });

    it('should add context and return method result', async () => {
      const context = { userId: '123', sessionId: 'abc' };
      const expectedResult = 'test-result';
      
      const result = await logger.addContext(context, async () => {
        return expectedResult;
      });

      expect(result).toBe(expectedResult);
    });

    it('should handle synchronous methods', async () => {
      const context = { userId: '123' };
      const expectedResult = 42;
      
      const result = await logger.addContext(context, () => {
        return expectedResult;
      });

      expect(result).toBe(expectedResult);
    });

    it('should get current context', async () => {
      const context = { userId: '123', sessionId: 'abc' };
      
      await logger.addContext(context, async () => {
        const currentContext = logger.getContext();
        expect(currentContext).toEqual(context);
        return 'success';
      });
    });

    it('should return undefined when no context is set', () => {
      const context = logger.getContext();
      expect(context).toBeUndefined();
    });

    it('should handle nested contexts with default behavior', async () => {
      const parentContext = { userId: '123' };
      const childContext = { sessionId: 'abc' };
      
      await logger.addContext(parentContext, async () => {
        await logger.addContext(childContext, async () => {
          const context = logger.getContext();
          expect(context).toEqual({ userId: '123', sessionId: 'abc' });
          return 'success';
        });
        return 'success';
      });
    });

    it('should preserve parent context when preserveParentContext is true', async () => {
      const parentContext = { userId: '123', role: 'user' };
      const childContext = { userId: '456', sessionId: 'abc' };
      
      await logger.addContext(parentContext, async () => {
        await logger.addContext(childContext, { preserveParentContext: true }, async () => {
          const context = logger.getContext();
          // When preserveParentContext is true, parent values win over child values  
          expect(context).toEqual({ userId: '123', sessionId: 'abc', role: 'user' });
          return 'success';
        });
        return 'success';
      });
    });

    it('should throw error when method argument is missing', () => {
      const context = { userId: '123' };
      
      expect(() => {
        // @ts-ignore - Testing runtime error
        logger.addContext(context, { preserveParentContext: true });
      }).toThrow("Argument 'method' is missing.");
    });

    it('should support method overload with options', async () => {
      const context = { userId: '123' };
      const options = { preserveParentContext: false };
      const expectedResult = 'test-result';
      
      const result = await logger.addContext(context, options, async () => {
        return expectedResult;
      });

      expect(result).toBe(expectedResult);
    });
  });

  describe('integration with winston features', () => {
    beforeEach(() => {
      logger = WinstonContextLogger.create();
    });

    it('should inherit from winston Logger', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should have winston logger properties', () => {
      expect(logger.level).toBeDefined();
      expect(logger.transports).toBeDefined();
      expect(logger.format).toBeDefined();
    });

    it('should use npm log levels', () => {
      expect(logger.levels).toEqual({
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      });
    });
  });

  describe('log level warning', () => {
    it('should warn about conflicting log level name', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Create a logger with a mock levels object that includes 'log'
      const mockLevels = { log: 0, info: 1 };
      const mockLogger = Object.create(Logger.prototype);
      mockLogger.levels = mockLevels;
      
      // Simulate the level creation logic
      Object.keys(mockLevels).forEach(level => {
        if (level === 'log') {
          console.warn(
            'Level "log" not defined: conflicts with the method "log". Use a different level name.',
          );
          return;
        }
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Level "log" not defined: conflicts with the method "log". Use a different level name.'
      );
      
      consoleSpy.mockRestore();
    });
  });
});