/**
 * Enhanced Environment Configuration for CounselFlow API
 * Comprehensive environment variable management with validation and defaults
 */

import { z } from 'zod';

// Core Application Schema
const envSchema = z.object({
  // Application Settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3005),
  APP_URL: z.string().default('http://localhost:3000'),
  API_URL: z.string().optional(),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  // JWT Authentication
  JWT_SECRET: z.string().min(8, 'JWT secret must be at least 8 characters'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT refresh secret must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_URL: z.string().optional(),

  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('CounselFlow <noreply@counselflow.com>'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Feature Flags
  ENABLE_REGISTRATION: z.coerce.boolean().default(true),
  ENABLE_PASSWORD_RESET: z.coerce.boolean().default(true),
  ENABLE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
  ENABLE_TWO_FACTOR_AUTH: z.coerce.boolean().default(false),
  ENABLE_API_DOCS: z.coerce.boolean().default(true),
  ENABLE_HEALTH_CHECKS: z.coerce.boolean().default(true),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
  LOG_FORMAT: z.enum(['json', 'combined']).default('json'),
  LOG_MAX_FILES: z.coerce.number().default(10),
  LOG_MAX_SIZE: z.string().default('10m'),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Performance
  REQUEST_TIMEOUT: z.coerce.number().default(30000),
  COMPRESSION_LEVEL: z.coerce.number().default(6),

  // AI Services (Optional)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OLLAMA_URL: z.string().default('http://localhost:11434'),

  // Cloud Storage (Optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Payment Processing (Optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Communication Services (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Monitoring (Optional)
  SENTRY_DSN: z.string().optional(),
  MIXPANEL_TOKEN: z.string().optional(),

  // Development Settings
  SWAGGER_ENABLED: z.coerce.boolean().default(false),
  DEBUG_MODE: z.coerce.boolean().default(false),
  TRUST_PROXY: z.coerce.boolean().default(false),
});

// Environment variable loading and validation
function loadEnvironment() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      console.error('🚨 Environment validation failed:');
      missingVars.forEach(msg => console.error(`  - ${msg}`));

      // In production, exit immediately
      if (process.env.NODE_ENV === 'production') {
        console.error('🔥 Production environment must have all required variables!');
        process.exit(1);
      }

      // In development, provide sensible defaults
      console.warn('⚠️  Using development defaults for missing variables...');
      return envSchema.parse({
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./prisma/dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'counselflow-dev-jwt-secret-2024',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'counselflow-dev-refresh-secret-2024',
      });
    }
    throw error;
  }
}

// Load and validate environment
export const env = loadEnvironment();

// Export type for TypeScript
export type Environment = z.infer<typeof envSchema>;

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Configuration presets
export const dbConfig = {
  url: env.DATABASE_URL,
};

export const jwtConfig = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

export const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  url: env.REDIS_URL,
};

export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.EMAIL_FROM,
};

export const logConfig = {
  level: env.LOG_LEVEL,
  dir: env.LOG_DIR,
  enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
  format: env.LOG_FORMAT,
  maxFiles: env.LOG_MAX_FILES,
  maxSize: env.LOG_MAX_SIZE,
};

console.log(`🚀 Environment loaded: ${env.NODE_ENV} mode on port ${env.PORT}`);
