import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { dispatch } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', form);
      dispatch({ type: 'LOGIN', payload: res.data.user });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-bold">Register</h1>
      {error && <p className="text-red-600">{error}</p>}
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      <button type="submit" className="btn-primary">Register</button>
    </form>
  );
};

export default Register;
