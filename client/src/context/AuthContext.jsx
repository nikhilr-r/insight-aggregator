import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context (The Box)
const AuthContext = createContext();

// 2. Create the Provider (The Wrapper Component)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      // Make request to OUR backend
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      // Save to State (React memory)
      setUser(data);
      
      // Save to LocalStorage (Browser memory - keeps you logged in on refresh)
      localStorage.setItem('user', JSON.stringify(data));
      
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // ... inside AuthProvider ...

  // Register Function
  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/users', {
        username,
        email,
        password,
      });

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // ... keep existing logout function ...



  // Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

   return (
    // Update the value to include 'register'
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;