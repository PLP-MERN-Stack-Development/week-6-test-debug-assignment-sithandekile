const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRouter');
const { register, login } = require('../../controllers/authController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Mock dependencies
jest.mock('../../controllers/authController');
jest.mock('../../middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should call register controller with valid data', async () => {
      register.mockImplementation((req, res) => {
        res.status(201).json({ message: 'User created successfully' });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(register).toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email, password, and username are required');
      expect(register).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email, password, and username are required');
      expect(register).not.toHaveBeenCalled();
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email, password, and username are required');
      expect(register).not.toHaveBeenCalled();
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 6 characters long');
      expect(register).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Please provide a valid email address');
      expect(register).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should call login controller with valid data', async () => {
      login.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Login successful' });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(login).toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
      expect(login).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
      expect(login).not.toHaveBeenCalled();
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      };

      authMiddleware.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      });
      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      authMiddleware.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Not authenticated' });
      });

      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify token and return user data', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      };

      authMiddleware.mockImplementation((req, res, next) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      });
    });

    it('should return 401 for invalid token', async () => {
      authMiddleware.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Invalid token' });
      });

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
});