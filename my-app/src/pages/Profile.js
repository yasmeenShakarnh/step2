import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  UserIcon,
  LockClosedIcon,
  PhotoIcon,
  TrashIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    profilePicture: null
  });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);

  const token = localStorage.getItem('accessToken');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8080/user/my-profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        const profilePictureLink = data._links?.['profile-picture']?.href;

        const profileData = {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          profilePicture: profilePictureLink
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
        setPreviewUrl(profilePictureLink);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(t('errors.loadProfileFailed'));
        setMessage({ text: t('errors.loadProfileFailed'), type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, t]);

  const validatePassword = (password) => {
    if (password && password.length < 8) {
      return t('errors.passwordLength');
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('errors.invalidEmail');
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: t('errors.invalidImageType'), type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: t('errors.fileSizeLimit'), type: 'error' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setPreviewUrl(originalProfile.profilePicture);
    }
    setSelectedFile(null);
    setPassword('');
    setMessage({ text: '', type: '' });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage({ text: passwordError, type: 'error' });
      return;
    }

    const emailError = validateEmail(profile.username);
    if (emailError) {
      setMessage({ text: emailError, type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      if (password) formData.append('password', password);
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      } else if (previewUrl === null) {
        formData.append('profilePicture', new File([], 'remove-profile-picture', { type: 'application/octet-stream' }));
      }

      const response = await axios.put('http://localhost:8080/user/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const tokenLink = response.data._links?.token;
      if (tokenLink && tokenLink.href) {
        localStorage.setItem('accessToken', tokenLink.href);
      }

      const profilePictureLink = response.data._links?.['profile-picture']?.href;

      const updatedProfile = {
        ...profile,
        profilePicture: profilePictureLink
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setPreviewUrl(profilePictureLink);

      setMessage({ text: response.data.content || t('messages.updateSuccess'), type: 'success' });
      setIsEditing(false);
      setPassword('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({
        text: error.response?.data?.content || t('errors.updateFailed'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  if (error && !profile.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100" dir={i18n.dir()}>
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t('errors.errorTitle')}</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5" />
            {t('buttons.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8" dir={i18n.dir()}>
      {/* زر تغيير اللغة */}
      <div className="fixed top-4 right-4 z-50">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-center relative">
            {/* Watermark effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-300 blur-xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-blue-200 blur-xl"></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">{t('profile.title')}</h1>
              <p className="text-blue-100">{t('profile.subtitle')}</p>
              
              {/* Profile picture with floating effect */}
              <motion.div 
                className="relative mt-6 mx-auto w-32 h-32"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 rounded-full shadow-lg border-4 border-white bg-blue-200 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt={t('profile.profileImageAlt')} 
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-3xl font-bold">
                      {`${(profile.firstName?.charAt(0) || '')}${(profile.lastName?.charAt(0) || '')}`.toUpperCase()}
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-2">
                    <motion.label 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-700 rounded-full p-2 shadow-lg hover:bg-blue-800 transition-all cursor-pointer"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <PhotoIcon className="h-5 w-5 text-white" />
                    </motion.label>
                    {previewUrl && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="bg-red-500 rounded-full p-2 shadow-lg hover:bg-red-600 transition-all"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Edit buttons */}
          <div className="px-8 pt-6 pb-4 flex justify-end">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
              >
                <PencilIcon className="h-5 w-5" />
                {t('profile.editProfile')}
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl shadow-md transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                  {t('buttons.cancel')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('buttons.saving')}...
                    </div>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      {t('profile.saveChanges')}
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Profile form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${message.type === 'success' ? 
                  'bg-green-50 text-green-700 border border-green-200' : 
                  'bg-red-50 text-red-700 border border-red-200'}`}
              >
                <div className="flex items-start">
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">
                {t('form.firstName')}
              </label>
              {isEditing ? (
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('form.firstNamePlaceholder')}
                  required
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-700 border border-transparent">
                  {profile.firstName}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">
                {t('form.lastName')}
              </label>
              {isEditing ? (
                <input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('form.lastNamePlaceholder')}
                  required
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-700 border border-transparent">
                  {profile.lastName}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="username">
                {t('form.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  type="email"
                  value={profile.username}
                  disabled
                  className="pl-10 w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-700 border border-transparent"
                  placeholder={t('form.emailPlaceholder')}
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{t('profile.passwordSettings')}</h3>
                  <p className="text-sm text-gray-500">{t('profile.passwordHint')}</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    {t('form.newPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t('form.newPasswordPlaceholder')}
                      minLength={8}
                    />
                  </div>
                  {password && (
                    <p className={`text-xs mt-1 ${
                      password.length >= 8 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {password.length >= 8 ? t('profile.strongPassword') : t('errors.passwordLength')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;