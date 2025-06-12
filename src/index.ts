export * from './core';

// use console implementation by default.
// can be swapped for other implementations (winston, pino, log4js, console)
// but would warrant a major version bump due to options model change.
export * from './console/createLogger';
export * from './console/logger';

// // to use winston implementation:
// export * from './winston/createLogger';
// export * from './winston/logger';
