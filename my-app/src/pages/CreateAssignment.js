import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CloudArrowUpIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const dueDate = new Date(formData.dueDate);
      const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} ${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}:${String(dueDate.getSeconds()).padStart(2, '0')}`;

      const formDataToSend = new FormData();
      formDataToSend.append('assignmentDTO', JSON.stringify({
        title: formData.title,
        description: formData.description,
        dueDate: formattedDueDate,
        maxScore: formData.totalMarks
      }));

      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      formDataToSend.append('courseId', courseId);

      await axios.post(
        'http://localhost:8080/assignments/create',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(t('assignment.success'));
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('assignment.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8" dir={i18n.dir()}>
      {/* Language Switcher */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
          <GlobeAltIcon className="h-5 w-5 text-gray-600" />
          <button
            onClick={() => changeLanguage('en')}
            className={`px-2 py-1 rounded-md text-sm ${i18n.language === 'en' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('ar')}
            className={`px-2 py-1 rounded-md text-sm ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            AR
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => navigate(`/courses/${courseId}`)}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                {t('assignment.back')}
              </motion.button>
              <h2 className="text-2xl font-bold flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2" />
                {t('assignment.title')}
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-green-700">{success}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('assignment.fields.title')} *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('assignment.fields.description')} *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                    {t('assignment.fields.dueDate')} *
                  </label>
                  <input
                    type="datetime-local"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <PaperClipIcon className="h-5 w-5 mr-2 text-blue-500" />
                    {t('assignment.fields.file')} *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <div className="space-y-3 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span className="px-3 py-2 bg-blue-50 hover:bg-blue-100">
                            {t('assignment.upload.choose')}
                          </span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            onChange={handleFileChange}
                            required
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-2 pt-2">{t('assignment.upload.orDrag')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, PPTX {t('assignment.upload.limit')}
                      </p>
                      {formData.file && (
                        <div className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <DocumentTextIcon className="h-4 w-4 mr-2 inline" />
                          {formData.file.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? t('assignment.submitting') : (
                      <>
                        <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                        {t('assignment.submit')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAssignment;
