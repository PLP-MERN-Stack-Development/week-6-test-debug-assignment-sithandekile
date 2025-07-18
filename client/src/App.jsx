import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import PostForm from './components/PostForm';
import { UserProvider } from './context/userContext';

function App() {
  return (
    
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posts-new" element={<PostForm />} />
        </Routes>
      </BrowserRouter>
      <h1>Hello World</h1>
    </UserProvider>
  );
}

export default App;
