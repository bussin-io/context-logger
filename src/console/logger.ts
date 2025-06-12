import { IContextLogger } from 'src/core';
import { createLogger } from './createLogger';

const globalSymbol = Symbol.for('@bussin/context-logger/console/singleton');

const g = globalThis as any;

if (!g[globalSymbol]) {
  g[globalSymbol] = createLogger();
}

export const logger: IContextLogger = g[globalSymbol];
