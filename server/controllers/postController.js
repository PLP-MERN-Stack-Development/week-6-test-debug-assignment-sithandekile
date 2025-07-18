const Post = require('../models/post');

// GET all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// CREATE a post
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.userId,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
