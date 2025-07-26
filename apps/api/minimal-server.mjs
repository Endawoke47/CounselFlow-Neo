// Minimal API Server Test
console.log('🚀 Starting minimal API server test...');

// Load environment first
import dotenv from 'dotenv';
dotenv.config();
console.log('✅ Environment variables loaded');

// Test environment config
try {
  const { env } = await import('./src/config/environment.js');
  console.log('✅ Environment config loaded:', env.NODE_ENV);
} catch (error) {
  console.error('❌ Environment config failed:', error.message);
  process.exit(1);
}

// Test logger
try {
  const enhancedLogger = (await import('./src/utils/logger.js')).default;
  console.log('✅ Enhanced logger loaded successfully');
  enhancedLogger.info('Test message from minimal server');
} catch (error) {
  console.error('❌ Logger failed:', error.message);
  process.exit(1);
}

// Test Express setup
try {
  const express = (await import('express')).default;
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Minimal server running' });
  });
  
  const PORT = process.env.PORT || 3005;
  const server = app.listen(PORT, () => {
    console.log(`✅ Minimal API server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📤 Gracefully shutting down...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
} catch (error) {
  console.error('❌ Express setup failed:', error.message);
  process.exit(1);
}
