import { AsyncLocalStorage } from 'node:async_hooks';
import { config, format, Logger, LoggerOptions, transports } from 'winston';
import { ContextOptions, IContextLogger } from '@bussin/context-logger/core';
import { WinstonContextLoggerOptions } from './WinstonContextLoggerOptions';

export class WinstonContextLogger extends Logger implements IContextLogger {
  [key: string]: any;

  static create(opts: WinstonContextLoggerOptions = {}): WinstonContextLogger {
    const storage = new AsyncLocalStorage<object>();

    opts.format ??= format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      format.json(),
    );

    const logger = new WinstonContextLogger(storage, {
      transports: [new transports.Console({ level: opts.level ?? 'info' })],
      ...opts,
      format: format.combine(
        format(info => {
          info.context = storage.getStore() ?? undefined;

          return info;
        })(),
        opts.format,
      ),
      levels: config.npm.levels,
    });

    function isLevelEnabledFunctionName(level: string) {
      return 'is' + level.charAt(0).toUpperCase() + level.slice(1) + 'Enabled';
    }

    Object.keys(logger.levels).forEach(level => {
      if (level === 'log') {
        console.warn(
          'Level "log" not defined: conflicts with the method "log". Use a different level name.',
        );
        return;
      }

      logger[level] = (...args: any[]) => {
        if (args.length === 1) {
          const [msg] = args;
          const info = msg && typeof msg === 'object' && msg.message ? msg : { message: msg };
          info.level = level;

          return logger.log(info);
        }

        if (args.length === 0) {
          return logger.log(level, '');
        }

        // @ts-ignore
        return logger.log(level, ...args);
      };

      logger[isLevelEnabledFunctionName(level)] = () => {
        return logger.isLevelEnabled(level);
      };
    });

    return logger;
  }

  private constructor(
    private readonly storage: AsyncLocalStorage<object>,
    opts: LoggerOptions,
  ) {
    super(opts);
  }

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
