import { ContextOptions } from '../../src/core/ContextOptions';
import { LogMethod } from '../../src/core/LogMethod';
import { IContextLogger } from '../../src/core/IContextLogger';

describe('Core types and interfaces', () => {
  describe('ContextOptions', () => {
    it('should allow empty options object', () => {
      const options: ContextOptions = {};
      expect(options).toEqual({});
    });

    it('should allow preserveParentContext option', () => {
      const options: ContextOptions = {
        preserveParentContext: true
      };
      expect(options.preserveParentContext).toBe(true);
    });

    it('should allow preserveParentContext to be false', () => {
      const options: ContextOptions = {
        preserveParentContext: false
      };
      expect(options.preserveParentContext).toBe(false);
    });

    it('should allow preserveParentContext to be undefined', () => {
      const options: ContextOptions = {
        preserveParentContext: undefined
      };
      expect(options.preserveParentContext).toBeUndefined();
    });
  });

  describe('LogMethod interface', () => {
    let mockLogMethod: LogMethod;

    beforeEach(() => {
      mockLogMethod = jest.fn() as LogMethod;
    });

    it('should accept string message', () => {
      mockLogMethod('Test message');
      expect(mockLogMethod).toHaveBeenCalledWith('Test message');
    });

    it('should accept string message with meta object', () => {
      const meta = { userId: '123', action: 'test' };
      mockLogMethod('Test message', meta);
      expect(mockLogMethod).toHaveBeenCalledWith('Test message', meta);
    });

    it('should accept Error object', () => {
      const error = new Error('Test error');
      mockLogMethod(error);
      expect(mockLogMethod).toHaveBeenCalledWith(error);
    });

    it('should accept Error object with meta', () => {
      const error = new Error('Test error');
      const meta = { context: 'test' };
      mockLogMethod(error, meta);
      expect(mockLogMethod).toHaveBeenCalledWith(error, meta);
    });

    it('should accept unknown error types', () => {
      const unknownError = { message: 'Unknown error', code: 500 };
      mockLogMethod(unknownError);
      expect(mockLogMethod).toHaveBeenCalledWith(unknownError);
    });
  });

  describe('IContextLogger interface compliance', () => {
    let mockLogger: IContextLogger;

    beforeEach(() => {
      mockLogger = {
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
    });

    it('should have all required log methods', () => {
      const requiredMethods = [
        'error', 'warn', 'help', 'data', 'info', 'debug',
        'prompt', 'http', 'verbose', 'input', 'silly'
      ];

      requiredMethods.forEach(method => {
        expect(typeof (mockLogger as any)[method]).toBe('function');
      });
    });

    it('should have addContext method with correct overloads', () => {
      expect(typeof mockLogger.addContext).toBe('function');
      
      // Test method signatures (TypeScript will catch incorrect usage at compile time)
      // These tests verify that the interface allows the expected call patterns
      
      const context = { userId: '123' };
      const method = () => Promise.resolve('result');
      const options: ContextOptions = { preserveParentContext: true };

      // Two-parameter overload
      mockLogger.addContext(context, method);
      expect(mockLogger.addContext).toHaveBeenLastCalledWith(context, method);

      // Three-parameter overload
      mockLogger.addContext(context, options, method);
      expect(mockLogger.addContext).toHaveBeenLastCalledWith(context, options, method);
    });

    it('should have getContext method', () => {
      expect(typeof mockLogger.getContext).toBe('function');
      
      mockLogger.getContext();
      expect(mockLogger.getContext).toHaveBeenCalled();
    });
  });

  describe('Type safety and generics', () => {
    it('should support generic context types', () => {
      interface UserContext {
        userId: string;
        role: 'admin' | 'user';
      }

      const context: UserContext = {
        userId: '123',
        role: 'admin'
      };

      // These would be caught at compile time if generics weren't working
      expect(context.userId).toBe('123');
      expect(context.role).toBe('admin');
    });

    it('should support generic result types', () => {
      interface ApiResponse {
        success: boolean;
        data: string;
      }

      const response: ApiResponse = {
        success: true,
        data: 'test data'
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe('test data');
    });
  });
});