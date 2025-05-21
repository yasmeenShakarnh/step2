import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LockClosedIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SparklesIcon } from 'lucide-react';

const colors = {
  primary: '#3498db',
  secondary: '#e67e22',
  background: '#f8f9fa',
  textDark: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#e0e0e0',
  gradient: 'linear-gradient(to right, #3498db, #2ecc71)'
};

const Login = () => {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const accessToken = query.get('access_token');
    const refreshToken = query.get('refresh_token');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      refreshToken && localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      navigate('/dashboard', { replace: true });
    }

    const token = localStorage.getItem('accessToken');
    if (token && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    errors[name] && setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = t('errors.requiredField');
      if (!formData.lastName.trim()) newErrors.lastName = t('errors.requiredField');
    }

    if (!formData.username.trim()) {
      newErrors.username = t('errors.requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = t('errors.invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('errors.requiredField');
    } else if (formData.password.length < 6) {
      newErrors.password = t('errors.shortPassword');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:8080/auth/login', {
          username: formData.username,
          password: formData.password
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        refresh_token && localStorage.setItem('refreshToken', refresh_token);
        window.location.href = '/dashboard';
      } else {
        await axios.post('http://localhost:8080/auth/register', {
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        });

        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', firstName: '', lastName: '' }));
        setErrors({ api: t('messages.registerSuccess') });
      }
    } catch (error) {
      setErrors({
        api: error.response?.data?.message || t('errors.authFailed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C7E2FC] to-[#f8f9fa] flex items-center justify-center p-4" dir={i18n.dir()}>
      {/* أزرار اللغة بالتنسيق الجديد */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
          <GlobeAltIcon className="h-5 w-5 text-gray-600" />
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 rounded-md text-sm ${
              i18n.language === 'en' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('ar')}
            className={`px-2 py-1 rounded-md text-sm ${
              i18n.language === 'ar' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            AR
          </button>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e0e0e0]">
          <div 
            className="p-6 text-center"
            style={{ background: colors.gradient }}
          >
            <h2 className="text-3xl font-bold text-white font-['Poppins']">
              {isLogin ? t('login.welcomeBack') : t('login.joinUs')}
            </h2>
            <p className="text-blue-100 mt-2 font-['Comic_Neue']">
              {isLogin ? t('login.loginMessage') : t('login.registerMessage')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {errors.api && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-lg text-sm ${
                  errors.api.toLowerCase().includes('success') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {errors.api}
              </motion.div>
            )}

            {!isLogin && (
              <>
                {/* First Name */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <label className="block text-[#2c3e50] text-sm font-medium mb-2 font-['Poppins']">
                    {t('login.firstName')}
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg border ${
                      errors.firstName ? 'border-red-500' : 'border-[#e0e0e0]'
                    } focus:outline-none focus:ring-2 focus:ring-[#3498db]`}
                    placeholder={t('login.firstName')}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </motion.div>

                {/* Last Name */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <label className="block text-[#2c3e50] text-sm font-medium mb-2 font-['Poppins']">
                    {t('login.lastName')}
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg border ${
                      errors.lastName ? 'border-red-500' : 'border-[#e0e0e0]'
                    } focus:outline-none focus:ring-2 focus:ring-[#3498db]`}
                    placeholder={t('login.lastName')}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </motion.div>

                {/* Role */}
                <div className="mb-4">
                  <label className="block text-[#2c3e50] text-sm font-medium mb-2 font-['Poppins']">
                    {t('login.iAm')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['STUDENT', 'INSTRUCTOR'].map((role) => (
                      <div
                        key={role}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          formData.role === role 
                            ? 'border-[#3498db] bg-[#3498db]/10' 
                            : 'border-[#e0e0e0] hover:border-[#3498db]/50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, role }))}
                      >
                        <span className="text-[#2c3e50] text-sm font-medium">
                          {role === 'STUDENT' ? t('login.student') : t('login.instructor')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Username */}
            <div className="mb-4">
              <label className="block text-[#2c3e50] text-sm font-medium mb-2 font-['Poppins']">
                {t('login.email')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7f8c8d]" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 w-full p-3 rounded-lg border ${
                    errors.username ? 'border-red-500' : 'border-[#e0e0e0]'
                  } focus:outline-none focus:ring-2 focus:ring-[#3498db]`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-[#2c3e50] text-sm font-medium mb-2 font-['Poppins']">
                {t('login.password')}
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7f8c8d]" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full p-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-[#e0e0e0]'
                  } focus:outline-none focus:ring-2 focus:ring-[#3498db]`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex justify-center items-center font-['Poppins']"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : isLogin ? t('login.login') : t('login.signUp')}
            </motion.button>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#3498db] hover:text-[#2980b9] text-sm font-medium font-['Poppins']"
              >
                {isLogin ? t('login.noAccount') : t('login.haveAccount')}
              </button>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-4 pb-6 text-center">
            <Link 
              to="/" 
              className="text-[#7f8c8d] hover:text-[#2c3e50] text-sm flex items-center justify-center font-['Comic_Neue']"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 10H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t('login.backToHome')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
