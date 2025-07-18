const request = require('supertest');
const app = require('../../app'); 
const User = require('../../models/User');
const bcrypt = require('bcrypt');

// Mock the User model and bcrypt
jest.mock('../../models/User');
jest.mock('bcrypt');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword'
      };

      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });
    });

    it('should return 400 for duplicate email', async () => {
      const error = new Error('Email already exists');
      User.create.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const error = new Error('Username is required');
      User.create.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
          // missing username
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    });

    it('should return 401 for user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should handle database errors during login', async () => {
      const error = new Error('Database connection failed');
      User.findOne.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database connection failed');
    });

    it('should handle bcrypt comparison errors', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});