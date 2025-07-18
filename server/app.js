const express = require('express');
const authRoutes = require('./routes/authRouter');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
