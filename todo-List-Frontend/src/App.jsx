import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm.jsx';
import Todos from './components/Todos.jsx';
import Profile from './components/Profile.jsx';
import './App.css';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('todos');

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setActivePage('todos');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActivePage('todos');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setActivePage('todos');
  };

  return (
    <div className="app-root">
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : activePage === 'profile' ? (
        <Profile onBackToTodos={() => setActivePage('todos')} onLogout={handleLogout} />
      ) : (
        <Todos onLogout={handleLogout} onOpenProfile={() => setActivePage('profile')} />
      )}
    </div>
  );
};


export default App;