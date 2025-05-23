import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { PuzzlePieceIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.js';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const EditLessonModal = ({ lesson, onClose, onLessonUpdated }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description,
    videoUrl: lesson.videoUrl,
    courseId: lesson.courseId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:8080/lessons/${lesson.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      onLessonUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError(err.response?.data?.message || t('errors.updateLessonFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Language switcher */}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all"
        dir={i18n.dir()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{t('editLesson.title')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editLesson.lessonTitle')}</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editLesson.description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('buttons.updating')}
                </span>
              ) : t('buttons.updateLesson')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DeleteConfirmationModal = ({ itemType, onClose, onConfirm }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Language switcher */}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        dir={i18n.dir()}
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('deleteConfirmation.title')}</h3>
          </div>
          <p className="text-gray-700 mb-6">
            {t('deleteConfirmation.message', { itemType: t(`itemTypes.${itemType}`) })}
          </p>
          <div className="flex justify-end space-x-4">
            <motion.button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.cancel')}
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.delete')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateLessonModal = ({ courseId, onClose, onLessonCreated }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    courseId: courseId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:8080/lessons/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      onLessonCreated();
      onClose();
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError(err.response?.data?.message || t('errors.createLessonFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Language switcher */}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all"
        dir={i18n.dir()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{t('createLesson.title')}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('createLesson.lessonTitle')}</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('createLesson.description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('buttons.creating')}
                </span>
              ) : t('buttons.createLesson')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AddResourceModal = ({ lessonId, onClose, onResourceAdded }) => {
  const { t, i18n } = useTranslation();
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceType, setResourceType] = useState('VIDEO');
  const [resourceTitle, setResourceTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleFileChange = (e) => {
    setResourceFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', resourceFile);
      formData.append('lessonId', lessonId);
      formData.append('title', resourceTitle);
      formData.append('type', resourceType);
      
      await axios.post(
        'http://localhost:8080/resources/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onResourceAdded();
      onClose();
    } catch (err) {
      console.error('Error adding resource:', err);
      setError(err.response?.data?.message || t('errors.addResourceFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Language switcher */}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        dir={i18n.dir()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{t('addResource.title')}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('addResource.resourceTitle')}</label>
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('addResource.resourceType')}</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="VIDEO">{t('resourceTypes.video')}</option>
              <option value="PDF">{t('resourceTypes.pdf')}</option>
              <option value="AUDIO">{t('resourceTypes.audio')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('addResource.file')}</label>
            <div className="mt-1">
              <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="flex flex-col items-center">
                  <PlusCircleIcon className="h-10 w-10 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">{t('addResource.clickToUpload')}</span> {t('addResource.orDragAndDrop')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {resourceType === 'VIDEO' ? t('fileTypes.video') : 
                     resourceType === 'PDF' ? t('fileTypes.pdf') : 
                     t('fileTypes.audio')}
                  </p>
                </div>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden"
                  required
                  accept={
                    resourceType === 'VIDEO' ? 'video/*' : 
                    resourceType === 'PDF' ? '.pdf' : 
                    'audio/*'
                  }
                />
              </label>
              {resourceFile && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  <span>{resourceFile.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('buttons.adding')}
                </span>
              ) : t('buttons.addResource')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const EditResourceModal = ({ resource, onClose, onResourceUpdated }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: resource.title,
    type: resource.type,
    url: resource.url
  });
  const [newFile, setNewFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      
      if (newFile) {
        formDataToSend.append('file', newFile);
      }
      
      const response = await axios.put(
        `http://localhost:8080/resources/${resource.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      onResourceUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating resource:', err);
      setError(err.response?.data?.message || t('errors.updateResourceFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Language switcher */}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        dir={i18n.dir()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{t('editResource.title')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('editResource.resourceTitle')}</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('editResource.resourceType')}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="VIDEO">{t('resourceTypes.video')}</option>
              <option value="PDF">{t('resourceTypes.pdf')}</option>
              <option value="AUDIO">{t('resourceTypes.audio')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('editResource.updateFile')}</label>
            <div className="mt-1">
              <label className="flex flex-col items-center px-4 py-6 bg-white rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="flex flex-col items-center">
                  <PlusCircleIcon className="h-10 w-10 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">{t('editResource.clickToUpload')}</span> {t('editResource.orDragAndDrop')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'VIDEO' ? t('fileTypes.video') : 
                     formData.type === 'PDF' ? t('fileTypes.pdf') : 
                     t('fileTypes.audio')}
                  </p>
                </div>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden"
                  accept={
                    formData.type === 'VIDEO' ? 'video/*' : 
                    formData.type === 'PDF' ? '.pdf' : 
                    'audio/*'
                  }
                />
              </label>
              {newFile ? (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  <span>{newFile.name}</span>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">
                  {t('editResource.currentFile')}: {resource.url.split('/').pop()}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? t('buttons.updating') : t('buttons.updateResource')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
const LessonsTab = ({ courseId, userRole }) => {
  const { t, i18n } = useTranslation();
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedLessonForResource, setSelectedLessonForResource] = useState(null);
  const [currentLessonToEdit, setCurrentLessonToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null });
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [currentResourceToEdit, setCurrentResourceToEdit] = useState(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const toggleLesson = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
    setCurrentVideo(null);
  };

  const handleViewResource = async (resource) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8080/resources/download/${resource.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      const contentType = response.headers['content-type'];
      
      if (contentType.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(new Blob([response.data], { type: contentType }));
        setCurrentVideo(videoUrl);
        setCurrentVideoTitle(resource.title);
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
        const link = document.createElement('a');
        link.href = url;
        
        let extension = '.txt';
        if (contentType.includes('pdf')) extension = '.pdf';
        else if (contentType.includes('mpeg')) extension = '.mp3';
        else if (contentType.includes('jpeg')) extension = '.jpg';
        else if (contentType.includes('png')) extension = '.png';
        
        link.setAttribute('download', resource.title + extension);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Error handling resource:', err);
      alert(t('errors.resourceProcessingFailed', { error: err.message }));
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error(t('errors.authenticationTokenNotFound'));
      }
      
      const lessonsResponse = await axios.get(
        `http://localhost:8080/lessons/course/${courseId}`, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setLessons(lessonsResponse.data);
      
      const resourcesData = {};
      await Promise.all(lessonsResponse.data.map(async (lesson) => {
        try {
          const resResponse = await axios.get(
            `http://localhost:8080/resources/lesson/${lesson.id}`,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          resourcesData[lesson.id] = resResponse.data;
        } catch (resErr) {
          console.error(`Error fetching resources for lesson ${lesson.id}:`, resErr);
          resourcesData[lesson.id] = [];
        }
      }));
      setResources(resourcesData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('errors.loadDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, t]);

  const handleCreateLesson = () => {
    setShowCreateLessonModal(true);
  };

  const handleResourceUpdated = () => {
    setShowEditResourceModal(false);
    fetchData();
  };

  const handleEditLesson = (lesson) => {
    setCurrentLessonToEdit(lesson);
    setShowEditLessonModal(true);
  };

  const handleAddResource = (lessonId) => {
    setSelectedLessonForResource(lessonId);
    setShowAddResourceModal(true);
  };

  const handleLessonCreated = () => {
    setShowCreateLessonModal(false);
    fetchData();
  };

  const handleLessonUpdated = () => {
    setShowEditLessonModal(false);
    fetchData();
  };

  const handleResourceAdded = () => {
    setShowAddResourceModal(false);
    fetchData();
  };

  const confirmDelete = (id, type) => {
    setItemToDelete({ id, type });
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = itemToDelete.type === 'lesson' 
        ? `http://localhost:8080/lessons/${itemToDelete.id}`
        : `http://localhost:8080/resources/${itemToDelete.id}`;

      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShowDeleteConfirmation(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(t('errors.deleteItemFailed', { error: err.message }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg shadow-sm"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <p className="font-medium text-red-700">{t('errors.errorLoadingData')}</p>
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              {t('buttons.refreshPage')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      {/* Language switcher */}
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <VideoCameraIcon className="h-5 w-5 mr-2 text-blue-500" />
          {t('lessonsTab.title')}
        </h2>
        
        {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
          <motion.button
            onClick={handleCreateLesson}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm shadow-md hover:shadow-lg transition-all"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('lessonsTab.createLesson')}
          </motion.button>
        )}
      </div>

      {showCreateLessonModal && (
        <CreateLessonModal 
          courseId={courseId}
          onClose={() => setShowCreateLessonModal(false)}
          onLessonCreated={handleLessonCreated}
        />
      )}

      {showEditLessonModal && currentLessonToEdit && (
        <EditLessonModal 
          lesson={currentLessonToEdit}
          onClose={() => setShowEditLessonModal(false)}
          onLessonUpdated={handleLessonUpdated}
        />
      )}

      {showEditResourceModal && currentResourceToEdit && (
        <EditResourceModal 
          resource={currentResourceToEdit}
          onClose={() => setShowEditResourceModal(false)}
          onResourceUpdated={handleResourceUpdated}
        />
      )}

      {showAddResourceModal && (
        <AddResourceModal
          lessonId={selectedLessonForResource}
          onClose={() => setShowAddResourceModal(false)}
          onResourceAdded={handleResourceAdded}
        />
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          itemType={itemToDelete.type}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDelete}
        />
      )}

      {lessons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <p className="text-yellow-700">{t('lessonsTab.noLessonsAvailable')}</p>
          </div>
        </motion.div>
      ) : (
        lessons.map((lesson) => (
          <motion.div 
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <button
              onClick={() => toggleLesson(lesson.id)}
              className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg mr-4 shadow-inner">
                  <VideoCameraIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm">{lesson.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                  <>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLesson(lesson);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(lesson.id, 'lesson');
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </>
                )}
                <div className="text-gray-400">
                  {expandedLesson === lesson.id ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>

            {expandedLesson === lesson.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="px-5 pb-5"
              >
                {lesson.videoUrl && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <VideoCameraIcon className="h-5 w-5 mr-2 text-red-500" />
                      {t('lessonsTab.lessonVideo')}
                    </h4>
                    <div className="rounded-lg overflow-hidden bg-black shadow-lg">
                      <video 
                        controls 
                        className="w-full"
                        src={lesson.videoUrl}
                      >
                        {t('lessonsTab.videoNotSupported')}
                      </video>
                    </div>
                  </div>
                )}

                {currentVideo && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <VideoCameraIcon className="h-5 w-5 mr-2 text-red-500" />
                      {currentVideoTitle}
                    </h4>
                    <div className="rounded-lg overflow-hidden bg-black shadow-lg">
                      <video 
                        controls 
                        autoPlay
                        className="w-full"
                        src={currentVideo}
                        onError={(e) => {
                          console.error('Video playback error:', e);
                          alert(t('errors.videoPlaybackFailed'));
                          setCurrentVideo(null);
                        }}
                      >
                        {t('lessonsTab.videoNotSupported')}
                      </video>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <motion.button
                        onClick={() => setCurrentVideo(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 shadow-sm"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('buttons.closeVideo')}
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentVideo;
                          link.setAttribute('download', currentVideoTitle + '.mp4');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        }}
                        className="px-3 py-1 bg-blue-200 text-blue-700 rounded text-sm hover:bg-blue-300 shadow-sm"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('buttons.downloadVideo')}
                      </motion.button>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700 flex items-center">
                      <PuzzlePieceIcon className="h-5 w-5 mr-2 text-blue-500" />
                      {t('lessonsTab.additionalResources')}
                    </h4>
                    {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                      <motion.button
                        onClick={() => handleAddResource(lesson.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center shadow-sm"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        {t('buttons.addResource')}
                      </motion.button>
                    )}
                  </div>

                  {resources[lesson.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resources[lesson.id].map((resource) => {
                        const type = resource.type?.toUpperCase();
                        let icon, actionLabel;
                        
                        switch(type) {
                          case 'VIDEO':
                            icon = <VideoCameraIcon className="h-5 w-5 text-red-500" />;
                            actionLabel = t('buttons.viewVideo');
                            break;
                          case 'PDF':
                            icon = <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
                            actionLabel = t('buttons.downloadPDF');
                            break;
                          case 'AUDIO':
                            icon = <SpeakerWaveIcon className="h-5 w-5 text-purple-500" />;
                            actionLabel = t('buttons.downloadAudio');
                            break;
                          default:
                            icon = <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
                            actionLabel = t('buttons.downloadResource');
                        }

                        return (
                          <motion.div 
                            key={resource.id} 
                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors shadow-sm"
                            whileHover={{ y: -2 }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-1">
                                {icon}
                              </div>
                              <div className="ml-3 flex-1">
                                <h6 className="font-medium text-gray-800">{resource.title}</h6>
                                <div className="flex justify-between items-center mt-1">
                                  <motion.button
                                    onClick={() => handleViewResource(resource)}
                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                    whileHover={{ x: 2 }}
                                  >
                                    {actionLabel}
                                  </motion.button>
                                  {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                                    <div className="flex space-x-2">
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCurrentResourceToEdit(resource);
                                          setShowEditResourceModal(true);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </motion.button>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          confirmDelete(resource.id, 'resource');
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800"
                                        whileHover={{ scale: 1.1 }}
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mt-2">
                      {t('lessonsTab.noResourcesAvailable')}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};


const AssignmentsTab = ({ courseId, userRole }) => {
  const { t, i18n } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/assignments/course/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (userRole === 'STUDENT') {
          const assignmentsWithSubmissionStatus = await Promise.all(
            response.data.map(async (assignment) => {
              try {
                const submissionResponse = await axios.get(
                  `http://localhost:8080/assignments/${assignment.id}/user-submission`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                );
                return {
                  ...assignment,
                  hasSubmitted: submissionResponse.data.exists,
                  submissionId: submissionResponse.data.submissionId,
                  grade: submissionResponse.data.grade,
                  feedback: submissionResponse.data.feedback,
                  allowResubmission: submissionResponse.data.allowResubmission
                };
              } catch (err) {
                return {
                  ...assignment,
                  hasSubmitted: false,
                  submissionId: null,
                  grade: null,
                  feedback: null,
                  allowResubmission: false
                };
              }
            })
          );
          setAssignments(assignmentsWithSubmissionStatus);
        } else {
          setAssignments(response.data);
        }
      } catch (err) {
        setError(t('errors.loadAssignmentsFailed'));
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId, userRole, t]);

  const handleViewAssignment = async (assignmentId, hasSubmitted, allowResubmission) => {
    if (userRole === 'STUDENT') {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://localhost:8080/assignments/${assignmentId}/user-submission`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );

        if (response.data.exists && !response.data.allowResubmission) {
          setError(t('errors.resubmissionNotAllowed'));
          return;
        }

        navigate(`/assignments/${assignmentId}`);
      } catch (err) {
        setError(t('errors.verifySubmissionFailed'));
        console.error(err);
      }
    } else {
      navigate(`/assignments/${assignmentId}`);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setIsDeleting(true);
    setAssignmentToDelete(assignmentId);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/assignments/${assignmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setSuccessMessage(t('successMessages.assignmentDeleted'));
    } catch (err) {
      setError(t('errors.deleteAssignmentFailed'));
      console.error('Error deleting assignment:', err);
    } finally {
      setIsDeleting(false);
      setAssignmentToDelete(null);
    }
  };

  const confirmDelete = (assignmentId) => {
    if (window.confirm(t('confirmations.deleteAssignment'))) {
      handleDeleteAssignment(assignmentId);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const submissionSuccess = queryParams.get('submissionSuccess');
    const assignmentId = queryParams.get('assignmentId');
    
    if (submissionSuccess === 'true') {
      setSuccessMessage(t('successMessages.assignmentSubmitted'));
      setAssignments(prev => prev.map(a => 
        a.id.toString() === assignmentId ? {...a, hasSubmitted: true} : a
      ));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [t]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg shadow-sm"
      >
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      {/* Language switcher */}
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
          {t('assignmentsTab.title')}
        </h2>
        
        {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to={`/courses/${courseId}/create-assignment`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 flex items-center text-sm shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('buttons.createAssignment')}
            </Link>
          </motion.div>
        )}
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <p className="text-yellow-700">{t('assignmentsTab.noAssignments')}</p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment, index) => (
            <motion.div 
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                userRole === 'STUDENT' && assignment.hasSubmitted 
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
                  : 'border-gray-100 hover:border-blue-100'
              } hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg shadow-inner">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{assignment.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                        <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full shadow-sm">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{t('assignmentsTab.dueDate')}: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {userRole === 'STUDENT' && assignment.hasSubmitted && (
                        <div className="mt-3 space-y-2">
                          {assignment.grade && (
                            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full shadow-sm w-fit">
                              <span className="font-medium text-gray-700 mr-2">{t('assignmentsTab.grade')}:</span>
                              <span className="text-blue-600 font-bold">
                                {assignment.grade}/{assignment.totalMarks}
                              </span>
                            </div>
                          )}
                          {assignment.feedback && (
                            <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                              <div className="flex items-center mb-1">
                                <span className="font-medium text-gray-700 mr-2">{t('assignmentsTab.feedback')}:</span>
                              </div>
                              <p className="text-gray-600 text-sm">{assignment.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {userRole === 'STUDENT' && assignment.hasSubmitted && (
                  <div className="px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center shadow-sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                    {t('assignmentsTab.submitted')}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                  <motion.button
                    onClick={() => confirmDelete(assignment.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isDeleting && assignmentToDelete === assignment.id}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium shadow-sm hover:bg-red-200 transition-all flex items-center"
                  >
                    {isDeleting && assignmentToDelete === assignment.id ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        {t('buttons.deleting')}
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        {t('buttons.delete')}
                      </>
                    )}
                  </motion.button>
                )}
                
                <div className="flex justify-end flex-1">
                  {userRole === 'STUDENT' ? (
                    assignment.hasSubmitted && !assignment.allowResubmission ? (
                      <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                        <LockClosedIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{t('assignmentsTab.submissionCompleted')}</span>
                      </div>
                    ) : (
                      <motion.button 
                        onClick={() => handleViewAssignment(assignment.id, assignment.hasSubmitted, assignment.allowResubmission)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-5 py-2.5 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all ${
                          assignment.hasSubmitted 
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                        }`}
                      >
                        <div className="flex items-center">
                          {assignment.hasSubmitted ? (
                            <>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              {t('buttons.resubmit')}
                            </>
                          ) : (
                            <>
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              {t('buttons.submitNow')}
                            </>
                          )}
                        </div>
                      </motion.button>
                    )
                  ) : (
                    <motion.button 
                      onClick={() => handleViewAssignment(assignment.id, false)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm font-medium shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        {t('buttons.viewDetails')}
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuizzesTab = ({ courseId, fetchQuizzes }) => {
  const { t, i18n } = useTranslation();
  const [userRole, setUserRole] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [quizScores, setQuizScores] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState('');
  const [editedOptions, setEditedOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    questions: [],
    startTime: '',
    endTime: ''
  });

  const [confirmationModal, setConfirmationModal] = useState({
  isOpen: false,
  quizId: null,
  message: ''
});
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', ''],
    correctAnswer: ''
  });
  
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
    } else {
      setUserRole('UNKNOWN');
    }
  }, []);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await fetchQuizzes();
        setQuizzes(data);
        
        if (userRole === 'STUDENT') {
          const statuses = {};
          for (const quiz of data) {
            try {
              const token = localStorage.getItem('accessToken');
              const response = await axios.get(
                `http://localhost:8080/api/quizzes/${quiz.id}/submissions/check`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              statuses[quiz.id] = response.data;
            } catch (err) {
              console.error(`Error checking submission status for quiz ${quiz.id}:`, err);
              statuses[quiz.id] = false;
            }
          }
          setSubmissionStatus(statuses);
        }
        
        setError(null);
      } catch (err) {
        setError(t('quizzesTab.errors.loadFailed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR' || userRole === 'STUDENT') {
      loadQuizzes();
    }
  }, [courseId, fetchQuizzes, userRole, t]);

  const toggleQuestions = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const handleEditQuestion = (quizId, questionIndex, question) => {
    setEditingQuestion({ quizId, questionIndex });
    setEditedText(question.text);
    setEditedCorrectAnswer(question.correctAnswer);
    setEditedOptions([...question.options]);
    setNewOption('');
  };

  const handleUpdateCorrectAnswer = async (questionId, newCorrectAnswer, quizId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:8080/api/quizzes/questions/${questionId}/correct-answer`,
        newCorrectAnswer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );
      
      const updatedQuizzes = await fetchQuizzes();
      setQuizzes(updatedQuizzes);
      return true;
    } catch (error) {
      console.error('Error updating correct answer:', error);
      alert(t('quizzesTab.errors.updateAnswerFailed'));
      return false;
    }
  };

  const handleSaveQuestion = async (quizId, questionIndex) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error(t('quizzesTab.errors.authFailed'));
      if (!editedText.trim()) throw new Error(t('quizzesTab.errors.emptyQuestion'));
      if (editedOptions.some(opt => !opt.trim())) throw new Error(t('quizzesTab.errors.emptyOptions'));
      if (!editedOptions.includes(editedCorrectAnswer)) {
        throw new Error(t('quizzesTab.errors.invalidCorrectAnswer'));
      }
      
      const currentQuiz = quizzes.find(q => q.id === quizId);
      if (!currentQuiz) throw new Error(t('quizzesTab.errors.quizNotFound'));
      const questionId = currentQuiz.questions[questionIndex]?.id;
      if (!questionId) throw new Error(t('quizzesTab.errors.questionNotFound'));
      
      const updateSuccess = await handleUpdateCorrectAnswer(
        questionId, 
        editedCorrectAnswer, 
        quizId
      );
      if (!updateSuccess) return;
      
      const updatedQuizzes = quizzes.map(quiz => {
        if (quiz.id === quizId) {
          const questions = [...quiz.questions];
          questions[questionIndex] = {
            ...questions[questionIndex],
            text: editedText,
            options: editedOptions,
            correctAnswer: editedCorrectAnswer
          };
          return { ...quiz, questions };
        }
        return quiz;
      });
      
      setQuizzes(updatedQuizzes);
      setEditingQuestion(null);
      alert(t('quizzesTab.success.questionUpdated'));
    } catch (err) {
      console.error('Error updating question:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      try {
        const originalData = await fetchQuizzes();
        setQuizzes(originalData);
      } catch (fetchError) {
        console.error(t('quizzesTab.errors.reloadFailed'), fetchError);
      }
      alert(`${t('quizzesTab.errors.updateFailed')}: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setEditedOptions([...editedOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    if (editedOptions.length <= 2) {
      alert(t('quizzesTab.errors.minOptions'));
      return;
    }
    const newOptions = [...editedOptions];
    newOptions.splice(index, 1);
    setEditedOptions(newOptions);
    if (editedCorrectAnswer === editedOptions[index]) {
      setEditedCorrectAnswer('');
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const quizData = {
        title: newQuiz.title,
        description: newQuiz.description,
        courseId: courseId,
        questions: newQuiz.questions,
        startTime: newQuiz.startTime,
        endTime: newQuiz.endTime
      };
      
      const response = await axios.post(
        'http://localhost:8080/api/quizzes',
        quizData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setQuizzes([...quizzes, response.data]);
      setShowCreateQuizModal(false);
      setNewQuiz({
        title: '',
        description: '',
        questions: [],
        startTime: '',
        endTime: ''
      });
      alert(t('quizzesTab.success.quizCreated'));
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert(t('quizzesTab.errors.createFailed'));
    }
  };

  const addQuestionToQuiz = () => {
    if (!newQuestion.text.trim() || !newQuestion.correctAnswer.trim()) {
      alert(t('quizzesTab.errors.fillAllFields'));
      return;
    }
    if (newQuestion.options.some(opt => !opt.trim())) {
      alert(t('quizzesTab.errors.emptyOptions'));
      return;
    }
    if (!newQuestion.options.includes(newQuestion.correctAnswer)) {
      alert(t('quizzesTab.errors.invalidCorrectAnswer'));
      return;
    }
    
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        text: newQuestion.text,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer
      }]
    }));
    
    setNewQuestion({
      text: '',
      options: ['', ''],
      correctAnswer: ''
    });
  };

  const addOptionToQuestion = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOptionFromQuestion = (index) => {
    if (newQuestion.options.length <= 2) {
      alert(t('quizzesTab.errors.minOptions'));
      return;
    }
    const newOptions = [...newQuestion.options];
    newOptions.splice(index, 1);
    setNewQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: prev.correctAnswer === newOptions[index] ? '' : prev.correctAnswer
    }));
  };

  const handleCloseQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:8080/api/quizzes/${quizId}/close`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, isClosed: true } : quiz
      ));
    } catch (err) {
      console.error('Error closing quiz:', err);
      alert(t('quizzesTab.errors.closeFailed'));
    }
  };

const handleDeleteQuiz = (quizId) => {
  setConfirmationModal({
    isOpen: true,
    quizId,
    message: t('quizzesTab.confirm.delete')
  });
};

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    await axios.delete(
      `http://localhost:8080/api/quizzes/${confirmationModal.quizId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    setQuizzes(quizzes.filter(quiz => quiz.id !== confirmationModal.quizId));
    setConfirmationModal({ isOpen: false, quizId: null, message: '' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    alert(t('quizzesTab.errors.deleteFailed'));
    setConfirmationModal({ isOpen: false, quizId: null, message: '' });
  }
};

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

if (userRole === 'STUDENT') {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">{t('quizzesTab.student.title')}</h1>
        <p className="text-blue-100 text-lg">
          {t('quizzesTab.student.subtitle')}
        </p>
      </div>
      
      {quizzes.map((quiz) => {
        const currentTime = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);
        const isQuizNotStarted = currentTime < startTime;
        const isQuizClosed = quiz.isClosed || currentTime > endTime;
        const isQuizActive = !isQuizNotStarted && !isQuizClosed;

        return (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <CalendarIcon className="h-5 w-5 mr-1" />
                      <span>{startTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-purple-600">
                      <ClockIcon className="h-5 w-5 mr-1" />
                      <span>{startTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isQuizClosed ? 'bg-red-100 text-red-800' : 
                  isQuizNotStarted ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {isQuizClosed ? t('quizzesTab.status.closed') : 
                   isQuizNotStarted ? t('quizzesTab.status.notStarted') : 
                   t('quizzesTab.status.open')}
                </div>
              </div>

              {submissionStatus[quiz.id] ? (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-blue-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-blue-800 font-semibold">{t('quizzesTab.student.completed')}</h4>
                    <p className="text-blue-600 text-sm">{t('quizzesTab.student.submitted')}</p>
                  </div>
                </div>
              ) : isQuizClosed ? (
                <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200 flex items-start">
                  <XCircleIcon className="h-6 w-6 text-red-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-red-800 font-semibold">{t('quizzesTab.student.closed')}</h4>
                    <p className="text-red-600 text-sm">{t('quizzesTab.student.periodEnded')}</p>
                  </div>
                </div>
              ) : isQuizNotStarted ? (
                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start">
                  <ClockIcon className="h-6 w-6 text-yellow-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-yellow-800 font-semibold">{t('quizzesTab.student.notStarted')}</h4>
                    <p className="text-yellow-600 text-sm">
                      {t('quizzesTab.student.availableOn')} {startTime.toLocaleDateString()} {t('quizzesTab.student.at')} {startTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>{t('quizzesTab.buttons.startQuiz')}</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
  return (
    <div className="space-y-8">
      {/* Language switcher */}
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

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('quizzesTab.instructor.title')}</h1>
            <p className="text-indigo-100 text-lg">
              {t('quizzesTab.instructor.subtitle')}
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateQuizModal(true)}
            className="px-5 py-3 bg-white text-indigo-600 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-100 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5" />
            <span>{t('quizzesTab.buttons.newQuiz')}</span>
          </motion.button>
        </div>
      </div>

      {quizzes.map((quiz) => (
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quiz.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {quiz.isClosed ? t('quizzesTab.status.closed') : t('quizzesTab.status.open')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{t('quizzesTab.labels.starts')}: {new Date(quiz.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{t('quizzesTab.labels.ends')}: {new Date(quiz.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                    <span>{quiz.questions?.length || 0} {t('quizzesTab.labels.questions')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleQuestions(quiz.id)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
              >
                {expandedQuiz === quiz.id ? (
                  <>
                    <ChevronUpIcon className="h-5 w-5 mr-1" />
                    {t('quizzesTab.buttons.hideDetails')}
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-5 w-5 mr-1" />
                    {t('quizzesTab.buttons.viewDetails')}
                  </>
                )}
              </button>
            </div>

            {expandedQuiz === quiz.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t"
              >
                <h4 className="font-medium text-gray-700 mb-3">{t('quizzesTab.labels.questions')}</h4>
                
                <div className="space-y-4">
                  {quiz.questions?.map((question, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {editingQuestion?.quizId === quiz.id && editingQuestion?.questionIndex === index ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('quizzesTab.labels.questionText')}
                            </label>
                            <input
                              type="text"
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('quizzesTab.labels.options')}
                            </label>
                            <div className="space-y-2">
                              {editedOptions.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...editedOptions];
                                      newOptions[optIndex] = e.target.value;
                                      setEditedOptions(newOptions);
                                    }}
                                    className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <button
                                    onClick={() => handleRemoveOption(optIndex)}
                                    className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                              
                              <div className="flex items-center mt-2">
                                <input
                                  type="text"
                                  value={newOption}
                                  onChange={(e) => setNewOption(e.target.value)}
                                  className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder={t('quizzesTab.placeholders.addOption')}
                                />
                                <button
                                  onClick={handleAddOption}
                                  className="ml-2 px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                                >
                                  {t('quizzesTab.buttons.add')}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('quizzesTab.labels.correctAnswer')}
                            </label>
                            <select
                              value={editedCorrectAnswer}
                              onChange={(e) => setEditedCorrectAnswer(e.target.value)}
                              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">{t('quizzesTab.placeholders.selectAnswer')}</option>
                              {editedOptions.map((option, i) => (
                                <option key={i} value={option}>
                                  {option || `${t('quizzesTab.labels.option')} ${i + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              {t('quizzesTab.buttons.cancel')}
                            </button>
                            <button
                              onClick={() => handleSaveQuestion(quiz.id, index)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              {t('quizzesTab.buttons.saveChanges')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">
                              {index + 1}. {question.text}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">{t('quizzesTab.labels.options')}:</span> {question.options.join(', ')}
                              </p>
                              <p className="text-sm text-green-600 mt-1">
                                <span className="font-medium">{t('quizzesTab.labels.correctAnswer')}:</span> {question.correctAnswer}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditQuestion(quiz.id, index, question)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-3">{t('quizzesTab.labels.submissions')}</h4>
                  
                  {quiz.submissions && quiz.submissions.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('quizzesTab.labels.student')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('quizzesTab.labels.score')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('quizzesTab.labels.submitted')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {quiz.submissions.map((submission) => (
                            <tr key={submission.studentId}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                {submission.studentName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  submission.score >= 80 ? 'bg-green-100 text-green-800' :
                                  submission.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {submission.score}%
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(submission.submissionDate).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 text-sm font-medium text-gray-700">{t('quizzesTab.labels.noSubmissions')}</h4>
                      <p className="mt-1 text-sm text-gray-500">{t('quizzesTab.labels.noSubmissionsDesc')}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <motion.button
                    onClick={() => handleCloseQuiz(quiz.id)}
                    disabled={quiz.isClosed}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                      quiz.isClosed 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                    whileHover={!quiz.isClosed ? { scale: 1.05 } : {}}
                    whileTap={!quiz.isClosed ? { scale: 0.95 } : {}}
                  >
                    {quiz.isClosed ? t('quizzesTab.buttons.quizClosed') : t('quizzesTab.buttons.closeQuiz')}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('quizzesTab.buttons.deleteQuiz')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Create Quiz Modal */}
      {showCreateQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t('quizzesTab.modal.createTitle')}</h2>
              <button
                onClick={() => setShowCreateQuizModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quizzesTab.labels.quizTitle')}
                </label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('quizzesTab.placeholders.quizTitle')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('quizzesTab.labels.description')}
                </label>
                <textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('quizzesTab.placeholders.description')}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('quizzesTab.labels.startTime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={newQuiz.startTime}
                    onChange={(e) => setNewQuiz({...newQuiz, startTime: e.target.value})}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('quizzesTab.labels.endTime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={newQuiz.endTime}
                    onChange={(e) => setNewQuiz({...newQuiz, endTime: e.target.value})}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">{t('quizzesTab.labels.questions')}</h3>
                
                {newQuiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{qIndex + 1}. {q.text}</p>
                        <p className="text-sm text-green-600 mt-1">
                          {t('quizzesTab.labels.correctAnswer')}: {q.correctAnswer}
                        </p>
                      </div>
                      <button
                        onClick={() => setNewQuiz({
                          ...newQuiz,
                          questions: newQuiz.questions.filter((_, i) => i !== qIndex)
                        })}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('quizzesTab.modal.addQuestion')}</h4>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('quizzesTab.labels.questionText')}
                    </label>
                    <input
                      type="text"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={t('quizzesTab.placeholders.questionText')}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('quizzesTab.labels.options')}
                    </label>
                    {newQuestion.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[optIndex] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOptions});
                          }}
                          className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`${t('quizzesTab.labels.option')} ${optIndex + 1}`}
                        />
                        <button
                          onClick={() => removeOptionFromQuestion(optIndex)}
                          className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addOptionToQuestion}
                      className="mt-1 text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {t('quizzesTab.buttons.addOption')}
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('quizzesTab.labels.correctAnswer')}
                    </label>
                    <select
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">{t('quizzesTab.placeholders.selectAnswer')}</option>
                      {newQuestion.options.map((option, i) => (
                        <option key={i} value={option} disabled={!option.trim()}>
                          {option || `${t('quizzesTab.labels.option')} ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addQuestionToQuiz}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    {t('quizzesTab.buttons.addQuestion')}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateQuizModal(false)}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('quizzesTab.buttons.cancel')}
              </button>
              <button
                onClick={handleCreateQuiz}
                disabled={!newQuiz.title.trim() || newQuiz.questions.length === 0}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {t('quizzesTab.buttons.createQuiz')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};


const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCourse(response.data);
      } catch (err) {
        setError('Failed to load course details');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8080/lessons/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching lessons:', err);
      return [];
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8080/assignments/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching assignments:', err);
      return [];
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8080/api/quizzes/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Courses
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100 transform transition-all hover:shadow-xl"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4 max-w-3xl">{course.description}</p>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg shadow-inner">
                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">{course.instructorName}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-4 gap-4">
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full shadow-sm">
                <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full shadow-sm">
                <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                <span>Enrolled</span>
              </div>
            </div>
          </div>
        </motion.div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 mb-8 shadow-md border border-gray-200">
            {['lessons', 'assignments', 'quizzes'].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    selected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {tab === 'lessons' && (
                  <>
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Lessons
                  </>
                )}
                {tab === 'assignments' && (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Assignments
                  </>
                )}
                {tab === 'quizzes' && (
                  <>
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Quizzes
                  </>
                )}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <LessonsTab courseId={courseId} userRole={user?.role} />
            </Tab.Panel>
            <Tab.Panel>
              <AssignmentsTab courseId={courseId} userRole={user?.role} />
            </Tab.Panel>
            <Tab.Panel>
              <QuizzesTab 
                courseId={courseId} 
                userRole={user?.role}
                fetchQuizzes={fetchQuizzes}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default CourseDetails;