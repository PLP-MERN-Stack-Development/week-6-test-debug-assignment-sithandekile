const authMiddleware = require('../../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  it('should call next() with valid token and user', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      username: 'testuser'
    };

    req.header.mockReturnValue('Bearer valid_token');
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no token is provided', async () => {
    req.header.mockReturnValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    req.header.mockReturnValue('Bearer invalid_token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not found', async () => {
    req.header.mockReturnValue('Bearer valid_token');
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    req.header.mockReturnValue('Bearer valid_token');
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockRejectedValue(new Error('Database error'));

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle Authorization header without Bearer prefix', async () => {
  req.header.mockReturnValue('just_token_without_bearer');

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' }); // ✅ match real behavior
  expect(next).not.toHaveBeenCalled();
});

  it('should handle empty Authorization header', async () => {
    req.header.mockReturnValue('');

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });
});