import { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// إنشاء سياق المصادقة
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false
  });

  const navigate = useNavigate();

  // تكوين Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleAutoLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // تسجيل الخروج التلقائي
  const handleAutoLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      error: 'Session expired. Please login again.'
    }));
    navigate('/login', { replace: true, state: { from: 'session-expired' } });
  }, [navigate]);

  // التحقق من حالة المصادقة
  const checkUserLoggedIn = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null
        }));
        return false;
      }

      const response = await axios.get('http://localhost:8080/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      if (!userData) {
        throw new Error('Invalid user data');
      }

      setAuthState({
        user: userData,
        isLoading: false,
        error: null,
        isAuthenticated: true
      });

      return true;
    } catch (err) {
      console.error('Authentication check failed:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: err.message,
        isAuthenticated: false
      }));
      return false;
    }
  }, []);

  // تحديث ملف المستخدم
  const updateUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/user/my-profile');
      const userData = response.data;

      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture
        }
      }));
    } catch (error) {
      console.error('فشل في تحديث ملف المستخدم:', error);
    }
  }, []);

  // تهيئة الحالة عند التحميل
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      await checkUserLoggedIn();
    };
    initializeAuth();
  }, [checkUserLoggedIn]);

  // تسجيل الدخول
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await axios.post('http://localhost:8080/auth/login', credentials);
      const { access_token, refresh_token, user: userData } = response.data;

      if (!access_token || !userData) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('accessToken', access_token);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }

      setAuthState({
        user: userData,
        isLoading: false,
        error: null,
        isAuthenticated: true
      });

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('Login error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  // التسجيل
  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await axios.post('http://localhost:8080/auth/register', userData);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('Registration error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  // تسجيل الخروج
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false
    });
    navigate('/login', { replace: true });
  }, [navigate]);

  // القيمة النهائية للسياق
  const contextValue = useMemo(() => ({
    ...authState,
    login,
    register,
    logout,
    checkUserLoggedIn,
    updateUserProfile
  }), [authState, login, register, logout, checkUserLoggedIn, updateUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook لاستخدام السياق
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
