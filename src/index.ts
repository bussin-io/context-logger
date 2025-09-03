export * from '#core';

// use console implementation by default.
// can be swapped for other implementations (winston, pino, log4js, console)
// but would warrant a major version bump due to options model change.
export { createLogger, logger } from '#console';

// // to use winston implementation:
// export { createLogger, logger } from '#winston';
