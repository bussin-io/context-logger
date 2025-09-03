import { IContextLogger } from '#core';
import { createLogger } from './createLogger.js';

const globalSymbol = Symbol.for('@bussin/context-logger/console/singleton');

const g = globalThis as any;

if (!g[globalSymbol]) {
  g[globalSymbol] = createLogger();
}

export const logger: IContextLogger = g[globalSymbol];
