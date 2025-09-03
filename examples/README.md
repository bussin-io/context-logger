# @bussin/context-logger Examples

This directory contains comprehensive examples demonstrating how to use the `@bussin/context-logger` package in various scenarios.

## Overview

The package provides context-aware logging with support for:
- **Winston** (default implementation) - Rich logging with transport support
- **Console** implementation - Structured JSON output to console
- **Dual ESM/CJS** support - Works in both module systems
- **TypeScript** first-class support with full type safety
- **Context isolation** - Perfect for concurrent operations

## Quick Start

```typescript
import { logger } from '@bussin/context-logger';

await logger.addContext({ userId: 'user-123' }, async () => {
  logger.info('User action started');
  // All logs within this context will include userId
});
```

## Examples

### 🎯 [winston.ts](./winston.ts)
Demonstrates the **default Winston implementation** which is now the primary logger.

```typescript
// Winston is now the default - both imports work the same way
import { createLogger } from '@bussin/context-logger';
// Or explicitly: import { createLogger } from '@bussin/context-logger/winston';
```

### 🖥️ [console.ts](./console.ts)
Shows how to use the **Console implementation** for structured JSON logging.

```typescript
import { createLogger } from '@bussin/context-logger/console';

const logger = createLogger({ 
  level: 'debug',
  includeTimestamp: true,
  includeContext: true 
});
```

### ⚡ [concurrency.ts](./concurrency.ts)
Demonstrates **context isolation** in concurrent operations - perfect for web servers handling multiple requests.

```typescript
// Each promise maintains separate context
Promise.all([
  logger.addContext({ id: 1 }, doAsyncJob),
  logger.addContext({ id: 2 }, doAsyncJob),
  logger.addContext({ id: 3 }, doAsyncJob),
]);
```

### 📚 [comprehensive-usage.ts](./comprehensive-usage.ts)
Complete feature walkthrough including:
- Default winston implementation
- Singleton logger usage
- Console implementation
- Custom winston configuration  
- All log levels
- Context options (`preserveParentContext`)
- Getting current context

### 🔧 [typescript-usage.ts](./typescript-usage.ts)
Advanced TypeScript patterns including:
- **Typed context objects** with interfaces
- **Generic context methods** 
- **Custom logger interfaces**
- **Factory patterns** for different environments
- **Error handling** with type safety

### 📜 [javascript-usage.js](./javascript-usage.js)
Plain JavaScript examples showing:
- **CommonJS** and **ESM** import patterns
- Usage without TypeScript
- Practical web service example
- All core functionality

## Package Structure

The package exports are organized as follows:

```typescript
// Main entry point - Winston implementation (default)
import { createLogger, logger, IContextLogger } from '@bussin/context-logger';

// Specific implementations
import { createLogger } from '@bussin/context-logger/console';
import { createLogger } from '@bussin/context-logger/winston';

// Core types and interfaces  
import { IContextLogger, ContextOptions } from '@bussin/context-logger/core';
```

## Key Features Demonstrated

### Context Inheritance
```typescript
await logger.addContext({ tenant: 'acme' }, async () => {
  await logger.addContext({ service: 'api' }, async () => {
    // Context has both: { tenant: 'acme', service: 'api' }
    logger.info('Both context values available');
  });
});
```

### Context Options
```typescript
// Default: child overrides parent
await logger.addContext({ key: 'parent' }, async () => {
  await logger.addContext({ key: 'child' }, async () => {
    // key = 'child'
  });
});

// Preserve parent: parent takes precedence
await logger.addContext({ key: 'parent' }, async () => {
  await logger.addContext(
    { key: 'child' }, 
    { preserveParentContext: true },
    async () => {
      // key = 'parent' 
    }
  );
});
```

### All Log Levels
Both implementations support Winston's log levels:
- `error`, `warn`, `help`, `data`, `info`, `debug`
- `prompt`, `http`, `verbose`, `input`, `silly`

### Type Safety (TypeScript)
```typescript
interface UserContext {
  userId: string;
  roles: string[];
}

await logger.addContext<UserContext>({ 
  userId: 'user-123',
  roles: ['admin']
}, async (ctx) => {
  // ctx is fully typed as UserContext
  if (ctx.roles.includes('admin')) {
    logger.info('Admin user detected');
  }
});
```

## Running Examples

```bash
# TypeScript examples (requires ts-node)
npx ts-node examples/winston.ts
npx ts-node examples/comprehensive-usage.ts

# JavaScript examples
node examples/javascript-usage.js
```

## Modern ESM/CJS Support

The package works seamlessly in both module systems:

**ESM (package.json with "type": "module")**
```javascript
import { logger } from '@bussin/context-logger';
```

**CommonJS (traditional Node.js)**
```javascript  
const { logger } = require('@bussin/context-logger');
```

## Implementation Comparison

| Feature | Winston (Default) | Console |
|---------|------------------|---------|
| Output Format | Configurable (JSON, simple, etc.) | Structured JSON |
| Transports | Multiple (file, console, etc.) | Console only |
| Performance | High | Very High |
| Configuration | Rich options | Simple options |
| Use Case | Production | Development/Simple apps |

Choose **Winston** (default) for production applications that need rich logging features, or **Console** for development and simple applications that need fast, structured output.