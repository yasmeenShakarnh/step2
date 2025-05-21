import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  UserIcon,
  LockClosedIcon,
  PhotoIcon,
  TrashIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

const Profile = () => {
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
        
        // Get profile picture URL from links
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
        setError('Failed to load profile data');
        setMessage({ text: 'Failed to load profile data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const validatePassword = (password) => {
    if (password && password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Please select an image file', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'File size should be less than 5MB', type: 'error' });
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

      const response = await axios.put('/user/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Store new token if it's returned in the response
      const tokenLink = response.data._links?.token;
      if (tokenLink && tokenLink.href) {
        localStorage.setItem('accessToken', tokenLink.href);
      }

      // Update profile picture URL from response
      const profilePictureLink = response.data._links?.['profile-picture']?.href;
      
      const updatedProfile = {
        ...profile,
        profilePicture: profilePictureLink
      };
      
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setPreviewUrl(profilePictureLink);
      
      setMessage({ text: response.data.content || 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
      setPassword('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ 
        text: error.response?.data?.content || 'Failed to update profile', 
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#C7E2FC] text-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <motion.div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iI0M3RTJGQyIgc3Ryb2tlLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-center relative">
            {/* Watermark effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-300 blur-xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-cyan-200 blur-xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
                <h1 className="text-3xl font-bold text-white ml-3 font-['Poppins']">Profile Settings</h1>
              </div>
              <p className="text-blue-100 font-['Comic_Neue']">Manage your personal information</p>
              
              {/* Profile picture with floating effect */}
              <motion.div 
                className="relative mt-6 mx-auto w-32 h-32"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 rounded-full shadow-lg border-4 border-white bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
                      {`${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-md transition-all"
              >
                <PencilIcon className="h-5 w-5" />
                Edit Profile
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
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-md transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Save Changes
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
                className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
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
                  <span className="font-['Comic_Neue']">{message.text}</span>
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-800 font-['Poppins']" htmlFor="firstName">
                First Name
              </label>
              {isEditing ? (
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-['Comic_Neue']"
                  placeholder="First Name"
                  required
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-transparent font-['Comic_Neue']">
                  {profile.firstName}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-800 font-['Poppins']" htmlFor="lastName">
                Last Name
              </label>
              {isEditing ? (
                <input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-['Comic_Neue']"
                  placeholder="Last Name"
                  required
                />
              ) : (
                <div className="w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-transparent font-['Comic_Neue']">
                  {profile.lastName}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-800 font-['Poppins']" htmlFor="username">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  type="email"
                  value={profile.username}
                  disabled
                  className="pl-10 w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-transparent font-['Comic_Neue']"
                  placeholder="Your email address"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-blue-100 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-800 font-['Poppins']">Password Settings</h3>
                  <p className="text-sm text-blue-600 font-['Comic_Neue']">Leave blank to keep your current password</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-800 font-['Poppins']" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-['Comic_Neue']"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                  </div>
                  {password && (
                    <p className={`text-xs mt-1 font-['Comic_Neue'] ${
                      password.length >= 8 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {password.length >= 8 ? '✓ Strong password' : 'Password must be at least 8 characters'}
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