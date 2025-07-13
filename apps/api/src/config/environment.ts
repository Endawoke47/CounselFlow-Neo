/**
 * Environment Configuration for API
 * Manages environment variables with validation
 */

import { z } from 'zod';

// Environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(8, 'JWT secret must be at least 8 characters'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT refresh secret must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Email Configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('CounselFlow <noreply@counselflow.com>'),
  
  // Application URL
  APP_URL: z.string().default('http://localhost:3000'),
  
  // Security
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Features
  ENABLE_REGISTRATION: z.coerce.boolean().default(true),
  ENABLE_PASSWORD_RESET: z.coerce.boolean().default(true),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
});

// Parse and validate environment variables
function loadEnvironment() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      console.error('Environment validation failed:');
      missingVars.forEach(msg => console.error(`  - ${msg}`));
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      // Return defaults for development
      return envSchema.parse({
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
      });
    }
    throw error;
  }
}

export const env = loadEnvironment();

// Export types
export type Environment = z.infer<typeof envSchema>;
