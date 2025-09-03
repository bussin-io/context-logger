// ESM smoke test - validates the package works correctly in ESM environments
import { createLogger } from '../../dist-es/winston/index.js';
import { createLogger as createConsoleLogger } from '../../dist-es/console/index.js';

console.log('ESM Smoke Tests:');

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

  console.log('ESM smoke test: PASSED');
} catch (error) {
  console.error('ESM smoke test: FAILED', error);
  process.exit(1);
}
