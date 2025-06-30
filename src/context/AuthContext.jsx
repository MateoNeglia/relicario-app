import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // valida el token y chequea si expiró
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);      
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {        
        return false;
      }
      return decoded;
    } catch (err) {
      console.error('isTokenValid: Error decoding token=', err.message);
      return false;
    }
  };

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          Cookies.get('refreshToken')
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post('/api/auth/refresh', {
              refreshToken: Cookies.get('refreshToken'),
            });
            const { accessToken, refreshToken } = res.data;
            Cookies.set('accessToken', accessToken, {
              expires: 1 / 24, 
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'Strict',
            });
            if (refreshToken) {
              Cookies.set('refreshToken', refreshToken, {
                expires: 7, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
              });
            }
            const decoded = isTokenValid(accessToken);
            if (decoded) {
              setUser({ id: decoded.id, username: decoded.username, email: decoded.email, role: decoded.role });
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              return axios(originalRequest);
            } else {
              logout();
              return Promise.reject(new Error('Invalid access token after refresh'));
            }
          } catch (refreshError) {
            console.error('Interceptor: Refresh error=', refreshError.message);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Restore session from accessToken
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = Cookies.get('accessToken');
      if (accessToken) {
        const decoded = isTokenValid(accessToken);
        if (decoded) {
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const userData = await getUserById(decoded.id);
            setUser(userData);
          } catch (err) {
            console.error('restoreSession: Error=', err.message);
            if (err.response?.status === 401) {
              logout();
            }
          }
        } else {
          logout();
        }
      } else {
        console.log('restoreSession: No access token found');
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await axios.post('/api/auth/login', { identifier, password });
      const { accessToken, refreshToken } = res.data;
      const decoded = isTokenValid(accessToken);
      if (!decoded) {
        throw new Error('Invalid access token');
      }

      Cookies.set('accessToken', accessToken, {
        expires: 1 / 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
      Cookies.set('refreshToken', refreshToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const userData = await getUserById(decoded.id);
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        role: 'user',
      });
      const { accessToken, refreshToken } = res.data;
      const decoded = isTokenValid(accessToken);
      if (!decoded) {
        throw new Error('Invalid access token');
      }

      Cookies.set('accessToken', accessToken, {
        expires: 1 / 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
      Cookies.set('refreshToken', refreshToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const userData = await getUserById(decoded.id);
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateNiches = async (niches) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const decoded = isTokenValid(accessToken);
      if (!decoded) {
        throw new Error('Invalid or expired access token');
      }

      const cleanedNiches = niches.map((niche) => ({
        category: niche.category,
        specific: niche.specific,
        isCustom: niche.isCustom || false,
      }));

      const res = await axios.patch(
        '/api/auth/profile',
        { niches: cleanedNiches },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update niches');
    }
  };

  const updateUser = async (formData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const decoded = isTokenValid(accessToken);
      if (!decoded) {
        throw new Error('Invalid or expired access token');
      }

      const res = await axios.patch('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const getUserById = async (userId) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const res = await axios.post(
        '/api/auth/profile',
        { user: { _id: userId } },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch user');
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google', { credential });
      const { accessToken, refreshToken } = response.data;
      const decoded = isTokenValid(accessToken);
      if (!decoded) {
        throw new Error('Invalid access token');
      }

      Cookies.set('accessToken', accessToken, {
        expires: 1 / 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
      Cookies.set('refreshToken', refreshToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const userData = await getUserById(decoded.id);
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, 
        loading,
        login,
        register,
        logout,
        updateNiches,
        updateUser,
        getUserById,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};