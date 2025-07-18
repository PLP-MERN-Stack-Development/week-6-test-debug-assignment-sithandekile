import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { dispatch } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', form);
      dispatch({ type: 'LOGIN', payload: res.data.user });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10 ">
      <h1 className="text-xl font-bold">Login</h1>
      {error && <p className="text-red-600">{error}</p>}
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      <button type="submit" className="btn-primary">Login</button>
    </form>
  );
};

export default Login;
