import { IContextLogger } from '@bussin/context-logger/core';
import { ConsoleContextLogger } from './ConsoleContextLogger';
import { ConsoleContextLoggerOptions } from './ConsoleContextLoggerOptions';

export function createLogger(): IContextLogger;
export function createLogger(options: ConsoleContextLoggerOptions): IContextLogger;
export function createLogger(options?: ConsoleContextLoggerOptions): IContextLogger {
  return ConsoleContextLogger.create(options);
}
