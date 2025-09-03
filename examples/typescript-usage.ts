// TypeScript usage examples with type safety and modern imports
import { createLogger, logger, IContextLogger, ContextOptions } from '@bussin/context-logger';
import { createLogger as createConsoleLogger, ConsoleContextLoggerOptions } from '@bussin/context-logger/console';
import { createLogger as createWinstonLogger, WinstonContextLoggerOptions } from '@bussin/context-logger/winston';

// Example 1: Typed context objects
interface UserContext {
  userId: string;
  sessionId: string;
  roles: string[];
}

interface RequestContext {
  requestId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  userAgent?: string;
}

const typedLogger: IContextLogger = createLogger({ level: 'info' });

const handleUserRequest = async () => {
  const userCtx: UserContext = {
    userId: 'user-123',
    sessionId: 'sess-456',
    roles: ['user', 'premium']
  };
  
  const requestCtx: RequestContext = {
    requestId: 'req-789',
    method: 'POST',
    path: '/api/users/profile',
    userAgent: 'MyApp/1.0'
  };

  await typedLogger.addContext(userCtx, async (ctx) => {
    // ctx is typed as UserContext & any existing context
    typedLogger.info('User request started', { userId: ctx.userId });
    
    await typedLogger.addContext(requestCtx, async (combinedCtx) => {
      // combinedCtx has both UserContext and RequestContext properties
      typedLogger.info('Processing request', {
        user: combinedCtx.userId,
        method: combinedCtx.method,
        path: combinedCtx.path
      });
      
      // Type-safe access to context
      if (combinedCtx.roles.includes('premium')) {
        typedLogger.info('Premium user detected');
      }
    });
  });
};

// Example 2: Typed logger options
const consoleLoggerWithOptions = createConsoleLogger({
  level: 'debug',
  includeTimestamp: true,
  includeLevel: true,
  includeContext: true,
  colors: false
} satisfies ConsoleContextLoggerOptions);

const winstonLoggerWithOptions = createWinstonLogger({
  level: 'verbose',
  transports: [
    new (require('winston')).transports.Console({
      format: require('winston').format.simple()
    })
  ]
} satisfies WinstonContextLoggerOptions);

// Example 3: Generic context methods
async function processWithTypedContext<T extends Record<string, any>>(
  contextData: T,
  options: ContextOptions = {},
  operation: (context: T) => Promise<void>
) {
  await typedLogger.addContext(contextData, options, operation);
}

// Usage with type inference
await processWithTypedContext(
  { orderId: 'order-123', customerId: 'cust-456' },
  { preserveParentContext: false },
  async (ctx) => {
    // ctx is inferred as { orderId: string, customerId: string }
    typedLogger.info('Processing order', { 
      order: ctx.orderId,
      customer: ctx.customerId 
    });
  }
);

// Example 4: Custom logger interface extension
interface ExtendedContextLogger extends IContextLogger {
  audit(message: string, meta?: Record<string, any>): void;
  security(message: string, meta?: Record<string, any>): void;
}

class CustomLogger implements ExtendedContextLogger {
  private baseLogger: IContextLogger;
  
  constructor(options?: WinstonContextLoggerOptions) {
    this.baseLogger = createWinstonLogger(options);
  }
  
  // Implement all IContextLogger methods by delegating
  addContext = this.baseLogger.addContext.bind(this.baseLogger);
  getContext = this.baseLogger.getContext.bind(this.baseLogger);
  error = this.baseLogger.error.bind(this.baseLogger);
  warn = this.baseLogger.warn.bind(this.baseLogger);
  help = this.baseLogger.help.bind(this.baseLogger);
  data = this.baseLogger.data.bind(this.baseLogger);
  info = this.baseLogger.info.bind(this.baseLogger);
  debug = this.baseLogger.debug.bind(this.baseLogger);
  prompt = this.baseLogger.prompt.bind(this.baseLogger);
  http = this.baseLogger.http.bind(this.baseLogger);
  verbose = this.baseLogger.verbose.bind(this.baseLogger);
  input = this.baseLogger.input.bind(this.baseLogger);
  silly = this.baseLogger.silly.bind(this.baseLogger);
  
  // Custom methods
  audit(message: string, meta?: Record<string, any>): void {
    this.info(`[AUDIT] ${message}`, { ...meta, logType: 'audit' });
  }
  
  security(message: string, meta?: Record<string, any>): void {
    this.warn(`[SECURITY] ${message}`, { ...meta, logType: 'security' });
  }
}

// Example 5: Factory pattern for different environments
type Environment = 'development' | 'staging' | 'production';

function createEnvironmentLogger(env: Environment): IContextLogger {
  switch (env) {
    case 'development':
      return createConsoleLogger({ 
        level: 'debug',
        colors: true,
        includeTimestamp: true 
      });
      
    case 'staging':
      return createWinstonLogger({
        level: 'info',
        format: require('winston').format.combine(
          require('winston').format.timestamp(),
          require('winston').format.json()
        )
      });
      
    case 'production':
      return createWinstonLogger({
        level: 'warn',
        format: require('winston').format.combine(
          require('winston').format.timestamp(),
          require('winston').format.errors({ stack: true }),
          require('winston').format.json()
        ),
        transports: [
          new (require('winston')).transports.Console(),
          new (require('winston')).transports.File({ filename: 'app.log' })
        ]
      });
  }
}

// Example 6: Async context with error handling
async function safeAsyncOperation<TContext extends Record<string, any>>(
  contextData: TContext,
  operation: (context: TContext) => Promise<void>
): Promise<void> {
  const logger = createLogger({ level: 'info' });
  
  await logger.addContext(contextData, async (ctx) => {
    try {
      logger.info('Operation started', { context: ctx });
      await operation(ctx);
      logger.info('Operation completed successfully');
    } catch (error) {
      logger.error('Operation failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: ctx
      });
      throw error; // Re-throw to allow caller to handle
    }
  });
}

// Usage examples
await handleUserRequest();

const customLogger = new CustomLogger({ level: 'info' });
await customLogger.addContext({ userId: 'admin-001' }, async () => {
  customLogger.audit('User login attempt', { ip: '192.168.1.1' });
  customLogger.security('Suspicious activity detected', { attempts: 5 });
});

const envLogger = createEnvironmentLogger('development');
await envLogger.addContext({ feature: 'typescript-demo' }, async () => {
  envLogger.info('Environment-specific logger created');
});

await safeAsyncOperation(
  { taskId: 'task-001', priority: 'high' },
  async (ctx) => {
    // Simulate some work that might fail
    if (Math.random() > 0.5) {
      throw new Error('Simulated failure');
    }
    console.log(`Processing task ${ctx.taskId} with priority ${ctx.priority}`);
  }
);

export { 
  typedLogger, 
  CustomLogger, 
  createEnvironmentLogger, 
  safeAsyncOperation 
};