// Export all core types and interfaces from the main entry point
export * from './core/IContextLogger.js';
export * from './core/ContextOptions.js';
export * from './core/LogMethod.js';

// use winston implementation by default.
export { createLogger, logger } from './winston/index.js';
