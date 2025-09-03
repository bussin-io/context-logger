import { IContextLogger } from '../core/index.js';
import { WinstonContextLogger } from './WinstonContextLogger.js';
import { WinstonContextLoggerOptions } from './WinstonContextLoggerOptions.js';

export function createLogger(): IContextLogger;
export function createLogger(options: WinstonContextLoggerOptions): IContextLogger;
export function createLogger(options?: WinstonContextLoggerOptions): IContextLogger {
  return WinstonContextLogger.create(options);
}
