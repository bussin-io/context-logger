import { IContextLogger } from 'src/core';
import { WinstonContextLogger } from './WinstonContextLogger';
import { WinstonContextLoggerOptions } from './WinstonContextLoggerOptions';

export function createLogger(): IContextLogger;
export function createLogger(options: WinstonContextLoggerOptions): IContextLogger;
export function createLogger(options?: WinstonContextLoggerOptions): IContextLogger {
  return WinstonContextLogger.create(options);
}
