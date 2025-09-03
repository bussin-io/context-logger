import { ConsoleContextLogger } from '../../src/console/ConsoleContextLogger';
import { ConsoleContextLoggerOptions } from '../../src/console/ConsoleContextLoggerOptions';

describe('ConsoleContextLogger', () => {
  let logger: ConsoleContextLogger;
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

  describe('constructor and factory', () => {
    it('should create logger with default options', () => {
      logger = ConsoleContextLogger.create();
      expect(logger).toBeInstanceOf(ConsoleContextLogger);
    });

    it('should create logger with custom options', () => {
      const options: ConsoleContextLoggerOptions = {
        level: 'debug',
        includeTimestamp: false,
        includeLevel: false,
        includeContext: false,
        colors: true,
      };
      logger = ConsoleContextLogger.create(options);
      expect(logger).toBeInstanceOf(ConsoleContextLogger);
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      logger = ConsoleContextLogger.create();
    });

    it('should log error messages', () => {
      const message = 'Test error message';
      logger.error(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log warn messages', () => {
      const message = 'Test warn message';
      logger.warn(message);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test warn message')
      );
    });

    it('should log info messages', () => {
      const message = 'Test info message';
      logger.info(message);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log debug messages when level is debug', () => {
      logger = ConsoleContextLogger.create({ level: 'debug' });
      const message = 'Test debug message';
      logger.debug(message);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });

    it('should log Error objects correctly', () => {
      const error = new Error('Test error');
      logger.error(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Test error.*stack.*Error/)
      );
    });

    it('should include metadata in logs', () => {
      const message = 'Test message';
      const meta = { userId: '123', action: 'test' };
      logger.info(message, meta);

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toBe(message);
      expect(logData.userId).toBe('123');
      expect(logData.action).toBe('test');
    });
  });

  describe('log levels', () => {
    it('should respect log levels', () => {
      logger = ConsoleContextLogger.create({ level: 'warn' });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('formatting options', () => {
    it('should include timestamp when enabled', () => {
      logger = ConsoleContextLogger.create({ includeTimestamp: true });
      logger.info('Test message');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.timestamp).toBeDefined();
      expect(new Date(logData.timestamp)).toBeInstanceOf(Date);
    });

    it('should exclude timestamp when disabled', () => {
      logger = ConsoleContextLogger.create({ includeTimestamp: false });
      logger.info('Test message');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.timestamp).toBeUndefined();
    });

    it('should include level when enabled', () => {
      logger = ConsoleContextLogger.create({ includeLevel: true });
      logger.info('Test message');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe('info');
    });

    it('should exclude level when disabled', () => {
      logger = ConsoleContextLogger.create({ includeLevel: false });
      logger.info('Test message');

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBeUndefined();
    });
  });

  describe('context management', () => {
    beforeEach(() => {
      logger = ConsoleContextLogger.create();
    });

    it('should add context to logging calls', async () => {
      const context = { userId: '123', sessionId: 'abc' };
      
      await logger.addContext(context, async () => {
        logger.info('Test message');
        return 'success';
      });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context).toEqual(context);
    });

    it('should return the method result', async () => {
      const context = { userId: '123' };
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
          logger.info('Nested message');
          const context = logger.getContext();
          expect(context).toEqual({ userId: '123', sessionId: 'abc' });
          return 'success';
        });
        return 'success';
      });

      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context).toEqual({ userId: '123', sessionId: 'abc' });
    });

    it('should preserve parent context when preserveParentContext is true', async () => {
      const parentContext = { userId: '123', role: 'user' };
      const childContext = { userId: '456', sessionId: 'abc' };
      
      await logger.addContext(parentContext, async () => {
        await logger.addContext(childContext, { preserveParentContext: true }, async () => {
          const context = logger.getContext();
          // When preserveParentContext is true, child context gets parent values, parent wins conflicts
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
  });

  describe('log method variants', () => {
    beforeEach(() => {
      logger = ConsoleContextLogger.create();
    });

    it('should have all required log methods', () => {
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.help).toBe('function');
      expect(typeof logger.data).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.prompt).toBe('function');
      expect(typeof logger.http).toBe('function');
      expect(typeof logger.verbose).toBe('function');
      expect(typeof logger.input).toBe('function');
      expect(typeof logger.silly).toBe('function');
    });

    it('should route different log levels to appropriate console methods', () => {
      logger = ConsoleContextLogger.create({ level: 'silly' }); // Enable all log levels
      
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.help('help');
      logger.data('data');
      logger.prompt('prompt');
      logger.http('http');
      logger.verbose('verbose');
      logger.input('input');
      logger.silly('silly');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(8); // info + help + data + prompt + http + verbose + input + silly
    });
  });
});