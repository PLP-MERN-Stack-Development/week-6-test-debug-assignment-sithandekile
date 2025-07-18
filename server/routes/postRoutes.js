//posts routes
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const  authMiddleware  = require('../middlewares/authMiddleware');

// Public routes
router.get('/', postController.getPosts);
// router.get('/:id', postController.getPostById);

// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
