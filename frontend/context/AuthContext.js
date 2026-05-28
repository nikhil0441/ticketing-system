import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../utils/api';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, refreshToken, user } = res.data;
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    const { token, user } = res.data;
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    setUser(user);
    return user;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isAgent = () => user?.role === 'SUPPORT_AGENT';
  const isUser = () => user?.role === 'USER';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAgent, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
