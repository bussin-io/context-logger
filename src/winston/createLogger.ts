import { IContextLogger } from '#core';
import { WinstonContextLogger } from './WinstonContextLogger.js';
import { WinstonContextLoggerOptions } from './WinstonContextLoggerOptions.js';

export function createLogger(): IContextLogger;
export function createLogger(options: WinstonContextLoggerOptions): IContextLogger;
export function createLogger(options?: WinstonContextLoggerOptions): IContextLogger {
  return WinstonContextLogger.create(options);
}
