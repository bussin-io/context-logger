import { AsyncLocalStorage } from 'node:async_hooks';
import { ContextOptions, IContextLogger, LogMethod } from '@bussin/context-logger/core';
import { ConsoleContextLoggerOptions } from './ConsoleContextLoggerOptions';

export class ConsoleContextLogger implements IContextLogger {
  private readonly storage = new AsyncLocalStorage<object>();

  static create(opts: ConsoleContextLoggerOptions = {}): ConsoleContextLogger {
    return new ConsoleContextLogger({
      level: opts.level ?? 'info',
      includeTimestamp: opts.includeTimestamp ?? true,
      includeLevel: opts.includeLevel ?? true,
      includeContext: opts.includeContext ?? true,
      colors: opts.colors ?? false, // Colors don't make sense in JSON format
    });
  }

  private constructor(private readonly options: Required<ConsoleContextLoggerOptions>) {}

  private readonly levelPriorities = {
    error: 0,
    warn: 1,
    help: 2,
    data: 3,
    info: 4,
    debug: 5,
    prompt: 6,
    http: 7,
    verbose: 8,
    input: 9,
    silly: 10,
  };

  private readonly levelColors = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    help: '\x1b[36m', // Cyan
    data: '\x1b[35m', // Magenta
    info: '\x1b[32m', // Green
    debug: '\x1b[34m', // Blue
    prompt: '\x1b[36m', // Cyan
    http: '\x1b[35m', // Magenta
    verbose: '\x1b[37m', // White
    input: '\x1b[90m', // Gray
    silly: '\x1b[90m', // Gray
  };

  private readonly resetColor = '\x1b[0m';

  private shouldLog(level: keyof typeof this.levelPriorities): boolean {
    const currentLevelPriority = this.levelPriorities[this.options.level];
    const messageLevelPriority = this.levelPriorities[level];
    return messageLevelPriority <= currentLevelPriority;
  }

  private formatMessage(
    level: keyof typeof this.levelPriorities,
    message: any,
    meta?: object,
  ): string {
    const logEntry: any = {};

    // Add timestamp
    if (this.options.includeTimestamp) {
      logEntry.timestamp = new Date().toISOString();
    }

    // Add level
    if (this.options.includeLevel) {
      logEntry.level = level;
    }

    // Add message
    if (message instanceof Error) {
      logEntry.message = message.message;
      logEntry.stack = message.stack;
      logEntry.name = message.name;
    } else if (typeof message === 'object' && message !== null) {
      // If message is an object, merge its properties
      Object.assign(logEntry, message);
    } else {
      logEntry.message = message;
    }

    // Add meta
    if (meta && Object.keys(meta).length > 0) {
      Object.assign(logEntry, meta);
    }

    // Add context
    if (this.options.includeContext) {
      const context = this.storage.getStore();
      if (context && Object.keys(context).length > 0) {
        logEntry.context = context;
      }
    }

    return JSON.stringify(logEntry);
  }

  private createLogMethod(level: keyof typeof this.levelPriorities): LogMethod {
    return ((messageOrError: any, meta?: object) => {
      if (!this.shouldLog(level)) {
        return;
      }

      const formattedMessage = this.formatMessage(level, messageOrError, meta);

      // Route to appropriate console method
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
        case 'help':
        case 'data':
        case 'prompt':
        case 'http':
        case 'verbose':
        case 'input':
        case 'silly':
        default:
          console.info(formattedMessage);
          break;
      }
    }) as LogMethod;
  }

  // Log methods
  error = this.createLogMethod('error');
  warn = this.createLogMethod('warn');
  help = this.createLogMethod('help');
  data = this.createLogMethod('data');
  info = this.createLogMethod('info');
  debug = this.createLogMethod('debug');
  prompt = this.createLogMethod('prompt');
  http = this.createLogMethod('http');
  verbose = this.createLogMethod('verbose');
  input = this.createLogMethod('input');
  silly = this.createLogMethod('silly');

  addContext<TResult, TContext extends object = object>(
    context: TContext,
    method: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult>;
  addContext<TResult, TContext extends object = object>(
    context: TContext,
    options: ContextOptions,
    method: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult>;
  addContext<TResult, TContext extends object = object>(
    context: TContext,
    optionsOrMethod: ContextOptions | ((context: TContext) => Promise<TResult> | TResult),
    method?: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult> {
    if (typeof optionsOrMethod === 'function') {
      return this._addContext(context, {}, optionsOrMethod);
    }

    if (!method) throw new Error("Argument 'method' is missing.");

    return this._addContext(context, optionsOrMethod, method);
  }

  private async _addContext<TResult, TContext extends object = object>(
    context: TContext,
    options: ContextOptions,
    method: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult> {
    const parentContext = this.storage.getStore();

    if (options.preserveParentContext) {
      context = { ...context, ...parentContext };
    } else {
      context = { ...parentContext, ...context };
    }

    return this.storage.run(context, async () => await method(context));
  }

  getContext<TContext extends object = object>(): TContext {
    return this.storage.getStore() as TContext;
  }
}
