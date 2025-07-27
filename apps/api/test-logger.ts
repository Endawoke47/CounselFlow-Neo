// Simple logger test
console.log('Starting logger test...');

try {
  import('./src/utils/logger').then((loggerModule) => {
    console.log('Logger imported successfully');
    const logger = loggerModule.default;
    console.log('Logger instance:', typeof logger);
    logger.info('Test log message');
    console.log('Logger test completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Logger import failed:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Logger test failed:', error);
  process.exit(1);
}
