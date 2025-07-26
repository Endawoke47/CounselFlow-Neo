// Debug server startup
console.log('Loading environment...');
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing environment config...');
try {
  const envModule = await import('./src/config/environment.js');
  const env = envModule.env;
  console.log('Environment loaded successfully:', env.NODE_ENV);
} catch (error) {
  console.error('Environment config failed:', error.message);
  process.exit(1);
}

console.log('Testing logger...');
try {
  const loggerModule = await import('./src/utils/logger.js');
  const enhancedLogger = loggerModule.default;
  console.log('Logger loaded successfully');
  enhancedLogger.info('Server starting test');
} catch (error) {
  console.error('Logger failed:', error.message);
  process.exit(1);
}

console.log('All tests passed!');
process.exit(0);
