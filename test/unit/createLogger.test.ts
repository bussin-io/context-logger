import { createLogger as createConsoleLogger } from '../../src/console/createLogger';
import { createLogger as createWinstonLogger } from '../../src/winston/createLogger';
import { ConsoleContextLogger } from '../../src/console/ConsoleContextLogger';
import { WinstonContextLogger } from '../../src/winston/WinstonContextLogger';
import { IContextLogger } from '../../src/core/IContextLogger';

describe('createLogger factories', () => {
  describe('Console createLogger', () => {
    it('should create a ConsoleContextLogger with no options', () => {
      const logger = createConsoleLogger();
      
      expect(logger).toBeInstanceOf(ConsoleContextLogger);
      expect(logger).toMatchObject({
        error: expect.any(Function),
        warn: expect.any(Function),
        info: expect.any(Function),
        debug: expect.any(Function),
        addContext: expect.any(Function),
        getContext: expect.any(Function),
      } as Partial<IContextLogger>);
    });

    it('should create a ConsoleContextLogger with custom options', () => {
      const options = {
        level: 'debug' as const,
        includeTimestamp: false,
        includeLevel: true,
        includeContext: false,
        colors: true,
      };
      
      const logger = createConsoleLogger(options);
      
      expect(logger).toBeInstanceOf(ConsoleContextLogger);
    });

    it('should implement IContextLogger interface', () => {
      const logger = createConsoleLogger();
      
      // Check that all required methods exist
      expect(typeof logger.addContext).toBe('function');
      expect(typeof logger.getContext).toBe('function');
      
      // Check all log methods exist
      const logMethods = ['error', 'warn', 'help', 'data', 'info', 'debug', 'prompt', 'http', 'verbose', 'input', 'silly'];
      logMethods.forEach(method => {
        expect(typeof (logger as any)[method]).toBe('function');
      });
    });
  });

  describe('Winston createLogger', () => {
    it('should create a WinstonContextLogger with no options', () => {
      const logger = createWinstonLogger();
      
      expect(logger).toBeInstanceOf(WinstonContextLogger);
      expect(logger).toMatchObject({
        error: expect.any(Function),
        warn: expect.any(Function),
        info: expect.any(Function),
        debug: expect.any(Function),
        addContext: expect.any(Function),
        getContext: expect.any(Function),
      } as Partial<IContextLogger>);
    });

    it('should create a WinstonContextLogger with custom options', () => {
      const options = {
        level: 'debug',
      };
      
      const logger = createWinstonLogger(options);
      
      expect(logger).toBeInstanceOf(WinstonContextLogger);
    });

    it('should implement IContextLogger interface', () => {
      const logger = createWinstonLogger();
      
      // Check that all required methods exist
      expect(typeof logger.addContext).toBe('function');
      expect(typeof logger.getContext).toBe('function');
      
      // Check basic log methods exist (Winston has npm levels)
      const logMethods = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
      logMethods.forEach(method => {
        expect(typeof (logger as any)[method]).toBe('function');
      });
    });
  });
});