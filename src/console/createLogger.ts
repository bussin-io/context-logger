import { IContextLogger } from '../core/index.js';
import { ConsoleContextLogger } from './ConsoleContextLogger.js';
import { ConsoleContextLoggerOptions } from './ConsoleContextLoggerOptions.js';

export function createLogger(): IContextLogger;
export function createLogger(options: ConsoleContextLoggerOptions): IContextLogger;
export function createLogger(options?: ConsoleContextLoggerOptions): IContextLogger {
  return ConsoleContextLogger.create(options);
}
