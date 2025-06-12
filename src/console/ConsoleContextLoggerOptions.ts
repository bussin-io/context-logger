export type LogLevel =
  | 'error'
  | 'warn'
  | 'help'
  | 'data'
  | 'info'
  | 'debug'
  | 'prompt'
  | 'http'
  | 'verbose'
  | 'input'
  | 'silly';

export interface ConsoleContextLoggerOptions {
  /** The minimum log level to output. Defaults to 'info' */
  level?: LogLevel;

  /** Whether to include timestamps in log output. Defaults to true */
  includeTimestamp?: boolean;

  /** Whether to include the log level in output. Defaults to true */
  includeLevel?: boolean;

  /** Whether to include context information in log output. Defaults to true */
  includeContext?: boolean;

  /** Whether to use colors in console output. Defaults to false (not applicable for JSON output) */
  colors?: boolean;
}
