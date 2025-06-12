import { LoggerOptions } from 'winston';

export type WinstonContextLoggerOptions = Omit<LoggerOptions, 'levels'>;
