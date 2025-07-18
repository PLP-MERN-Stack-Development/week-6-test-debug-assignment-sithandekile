const generateToken = require('../../utility/generateToken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret'; 
}

describe('generateToken', () => {
  it('should return a valid JWT token', () => {
    const token = generateToken({ _id: '123' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
  });
});
