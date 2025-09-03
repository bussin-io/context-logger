// CJS smoke test - validates the package works correctly in CommonJS environments
const { createLogger } = require('../../dist-cjs/winston/index.js');
const { createLogger: createConsoleLogger } = require('../../dist-cjs/console/index.js');

console.log('CJS Smoke Tests:');

// Test winston logger
console.log('- Winston createLogger type:', typeof createLogger === 'function' ? '✓' : '✗');

// Test console logger
console.log('- Console createLogger type:', typeof createConsoleLogger === 'function' ? '✓' : '✗');

// Test logger instantiation
try {
  const winstonLogger = createLogger();
  console.log('- Winston logger instantiation:', winstonLogger ? '✓' : '✗');
  console.log(
    '- Winston logger has info method:',
    typeof winstonLogger.info === 'function' ? '✓' : '✗',
  );

  const consoleLogger = createConsoleLogger();
  console.log('- Console logger instantiation:', consoleLogger ? '✓' : '✗');
  console.log(
    '- Console logger has info method:',
    typeof consoleLogger.info === 'function' ? '✓' : '✗',
  );

  console.log('CJS smoke test: PASSED');
} catch (error) {
  console.error('CJS smoke test: FAILED', error);
  process.exit(1);
}
