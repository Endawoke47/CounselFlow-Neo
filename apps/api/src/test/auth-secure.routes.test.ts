/**
 * Secure API Routes Integration Tests
 * Tests for authentication endpoints and middleware
 */

import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import secureAuthRouter from '../routes/auth-secure.routes';
import { rateLimitMiddleware } from '../middleware/rate-limit';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/api/auth', secureAuthRouter);
  return app;
};

describe('Authentication API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'TestPassword123!',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('firstName', userData.firstName);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'TestPassword123!',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@counselflow.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'weak',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with password mismatch', async () => {
      const userData = {
        email: 'test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'DifferentPassword456!',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'TestPassword123!',
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Duplicate registration
      const response = await request(app).post('/api/auth/register').send(userData).expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user
      const userData = {
        email: 'login-test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'Login',
        lastName: 'Test',
        confirmPassword: 'TestPassword123!',
      };

      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login-test@counselflow.com',
        password: 'TestPassword123!',
        rememberMe: false,
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body.tokens).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with incorrect password', async () => {
      const loginData = {
        email: 'login-test@counselflow.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@counselflow.com',
        password: 'TestPassword123!',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle rate limiting after multiple failed attempts', async () => {
      const loginData = {
        email: 'login-test@counselflow.com',
        password: 'WrongPassword123!',
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send(loginData).expect(401);
      }

      // Next attempt should be rate limited
      const response = await request(app).post('/api/auth/login').send(loginData).expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many failed attempts');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const userData = {
        email: 'refresh-test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'Refresh',
        lastName: 'Test',
        confirmPassword: 'TestPassword123!',
      };

      await request(app).post('/api/auth/register').send(userData);

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body.tokens).toHaveProperty('expiresIn');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid refresh token');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({}).expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const userData = {
        email: 'logout-test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'Logout',
        lastName: 'Test',
        confirmPassword: 'TestPassword123!',
      };

      await request(app).post('/api/auth/register').send(userData);

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should reject logout without token', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Register a test user
      const userData = {
        email: 'forgot-test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'Forgot',
        lastName: 'Test',
        confirmPassword: 'TestPassword123!',
      };

      await request(app).post('/api/auth/register').send(userData);
    });

    it('should handle forgot password request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot-test@counselflow.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset email sent');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should not reveal if email exists (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@counselflow.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset email sent');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const userData = {
        email: 'me-test@counselflow.com',
        password: 'TestPassword123!',
        firstName: 'Me',
        lastName: 'Test',
        confirmPassword: 'TestPassword123!',
      };

      await request(app).post('/api/auth/register').send(userData);

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'me-test@counselflow.com');
      expect(response.body.user).toHaveProperty('firstName', 'Me');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });
});

describe('Rate Limiting Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/auth', rateLimitMiddleware);
    app.post('/api/auth/test', (req, res) => {
      res.json({ success: true });
    });
  });

  it('should allow requests under the limit', async () => {
    // Make several requests under the limit
    for (let i = 0; i < 5; i++) {
      const response = await request(app).post('/api/auth/test').expect(200);

      expect(response.body).toHaveProperty('success', true);
    }
  });

  it('should block requests over the limit', async () => {
    // Make requests to exceed the limit (assuming 100 requests per 15 minutes)
    const promises = [];
    for (let i = 0; i < 105; i++) {
      promises.push(request(app).post('/api/auth/test').send({}));
    }

    const responses = await Promise.all(promises);

    // Check that some requests were blocked
    const blockedResponses = responses.filter(r => r.status === 429);
    expect(blockedResponses.length).toBeGreaterThan(0);
  });
});
