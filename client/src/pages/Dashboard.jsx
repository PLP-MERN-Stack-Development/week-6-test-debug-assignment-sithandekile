import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (!user) return <p>Please log in to view your dashboard.</p>;
  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Welcome, {user.username}</h1>
      <Link to="/posts/new" className="bg-purple-700 text-white px-4 py-2 rounded">
        Create New Post
      </Link>
      <div className="mt-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="border p-4 my-2 rounded shadow">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p>{post.content.substring(0, 100)}...</p>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
