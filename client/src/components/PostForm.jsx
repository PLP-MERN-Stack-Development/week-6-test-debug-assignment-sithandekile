import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const { token } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/posts', { title, content, category }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create post:', err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Content"
          rows={5}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Category ID (optional)"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-700 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PostForm;
