import { type ContextOptions } from './ContextOptions.js';
import { type LogMethod } from './LogMethod.js';

export interface IContextLogger {
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
    optionsOrMethod: ContextOptions | ((context?: TContext) => Promise<TResult> | TResult),
    method?: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult>;

  getContext<TContext extends object = object>(): TContext;

  error: LogMethod;
  warn: LogMethod;
  help: LogMethod;
  data: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  prompt: LogMethod;
  http: LogMethod;
  verbose: LogMethod;
  input: LogMethod;
  silly: LogMethod;
}
