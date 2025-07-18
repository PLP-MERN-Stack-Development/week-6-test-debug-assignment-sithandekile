const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Post = require('../../models/post');
const User = require('../../models/User');
const { generateToken } = require('../../utility/generateToken');

// Test variables
let mongoServer;
let token;
let userId;
let postId;

// Set timeout for all tests
jest.setTimeout(120000);

describe('Posts API Integration Tests', () => {
  beforeAll(async () => {
    try {
      // Close existing connections
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      // Start MongoDB Memory Server
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'testdb',
        },
      });

      const mongoUri = mongoServer.getUri();
      console.log('Connecting to MongoDB:', mongoUri);

      // Connect with timeout options
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      });

      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Error in afterAll:', error);
    }
  });

  beforeEach(async () => {
    try {
      // Clear collections
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
          await collection.deleteMany({});
        }
      }

      // Create test user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      userId = user._id;
      token = generateToken(user);

      // Create test post
      const post = await Post.create({
        title: 'Test Post',
        content: 'This is a test post content',
        author: userId,
        category: new mongoose.Types.ObjectId(),
        slug: 'test-post',
      });

      postId = post._id;
    } catch (error) {
      console.error('Error in beforeEach:', error);
      throw error;
    }
  });

  describe('POST /api/posts', () => {
    test('should create a new post when authenticated', async () => {
      const newPost = {
        title: 'New Test Post',
        content: 'This is a new test post content',
        category: new mongoose.Types.ObjectId().toString(),
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(newPost);

      console.log('POST /api/posts response:', res.status, res.body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(newPost.title);
      expect(res.body.content).toBe(newPost.content);
      expect(res.body.author).toBe(userId.toString());
    });

    test('should return 401 if not authenticated', async () => {
      const newPost = {
        title: 'Unauthorized Post',
        content: 'This should not be created',
        category: new mongoose.Types.ObjectId().toString(),
      };

      const res = await request(app)
        .post('/api/posts')
        .send(newPost);

      console.log('POST /api/posts (no auth) response:', res.status, res.body);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/posts', () => {
    test('should return all posts', async () => {
      const res = await request(app).get('/api/posts');

      console.log('GET /api/posts response:', res.status, 'Length:', res.body?.length);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/posts/:id', () => {
    test('should return a post by ID', async () => {
      const res = await request(app).get(`/api/posts/${postId}`);

      console.log('GET /api/posts/:id response:', res.status, res.body?.title);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(postId.toString());
      expect(res.body.title).toBe('Test Post');
    });

    test('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/posts/${nonExistentId}`);

      console.log('GET /api/posts/:id (404) response:', res.status);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    test('should update a post when authenticated as author', async () => {
      const updates = {
        title: 'Updated Test Post',
        content: 'This content has been updated',
      };

      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      console.log('PUT /api/posts/:id response:', res.status, res.body?.title);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updates.title);
      expect(res.body.content).toBe(updates.content);
    });

    test('should return 401 if not authenticated', async () => {
      const updates = { title: 'Unauthorized Update' };

      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .send(updates);

      console.log('PUT /api/posts/:id (no auth) response:', res.status);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    test('should delete a post when authenticated as author', async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`);

      console.log('DELETE /api/posts/:id response:', res.status);

      expect(res.status).toBe(200);

      const deletedPost = await Post.findById(postId);
      expect(deletedPost).toBeNull();
    });

    test('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/posts/${postId}`);

      console.log('DELETE /api/posts/:id (no auth) response:', res.status);

      expect(res.status).toBe(401);
    });
  });
});