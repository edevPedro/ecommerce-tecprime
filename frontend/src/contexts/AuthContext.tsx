import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  userId: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      // Basic validation to ensure email exists
      if (parsed && !parsed.email) return null; 
      return parsed;
    } catch {
      return null;
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return false;
    try {
      const parsed = JSON.parse(storedUser);
      return !!parsed.email;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Sync state if localStorage changes externally (optional but good practice)
    // Or just to handle cleanup if validation failed during init
    if (!user || !isAuthenticated) {
       // if we determined invalid state during init, clear storage
       const token = localStorage.getItem('token');
       const storedUser = localStorage.getItem('user');
       if (token && (!storedUser || !JSON.parse(storedUser).email)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
       }
    }
  }, [user, isAuthenticated]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    // Attempt to log the logout event before clearing credentials
    try {
      await api.post('/logs/event', {
        event: 'LOGOUT',
        details: { userId: user?.userId, username: user?.username }
      });
    } catch (e) {
      console.warn('Failed to log logout event', e);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

