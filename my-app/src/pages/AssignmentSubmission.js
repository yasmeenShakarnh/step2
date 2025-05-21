import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.js';
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  UserIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  PaperClipIcon,
  CloudArrowUpIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AssignmentSubmission = () => {
  const { t, i18n } = useTranslation();
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solutionText, setSolutionText] = useState('');
  const [solutionFile, setSolutionFile] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [studentSubmission, setStudentSubmission] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { user } = useContext(AuthContext);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  useEffect(() => {
    const fetchUserRole = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8080/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignment(response.data);
if (userRole === 'STUDENT') {
  const submissionResponse = await axios.get(
    `http://localhost:8080/assignments/${assignmentId}/user-submission`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (submissionResponse.data.exists) {
    setStudentSubmission({
      ...submissionResponse.data,
      hasSubmitted: true
    });
  }
}


        if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
          const submissionsResponse = await axios.get(
            `http://localhost:8080/assignments/${assignmentId}/submissions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSubmissions(submissionsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError(t('assignmentSubmission.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchAssignment();
    }
  }, [assignmentId, userRole, t]);

  const downloadAssignmentFile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8080/assignments/${assignmentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assignment_${assignmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(t('assignmentSubmission.errors.downloadFailed'));
    }
  };

  const downloadStudentFile = async (submissionId, studentName) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8080/assignments/submissions/${submissionId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const contentDisposition = response.headers['content-disposition'];
      let fileName = studentName ? `${studentName}_solution.pdf` : 'submission.pdf';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(t('assignmentSubmission.errors.downloadFailed'));
    }
  };

  const handleFileChange = (e) => {
    setSolutionFile(e.target.files[0]);
  };

  const submitFeedback = async (submissionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:8080/assignments/submissions/${submissionId}/feedback`,
        { feedback: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const submissionsResponse = await axios.get(
        `http://localhost:8080/assignments/${assignmentId}/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(submissionsResponse.data);
      setFeedbackText('');
      setSubmissionStatus('feedback-success');
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(t('assignmentSubmission.errors.feedbackFailed'));
      setSubmissionStatus('feedback-error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmissionStatus(null);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      if (solutionText?.trim()) {
        formData.append('solutionText', solutionText);
      }
      
      if (solutionFile) {
        if (solutionFile.size > 5 * 1024 * 1024) {
          throw new Error(t('assignmentSubmission.messages.fileTooLarge'));
        }
        formData.append('solutionFile', solutionFile);
      }

      await axios.post(
        `http://localhost:8080/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSubmissionStatus('success');
      const submissionResponse = await axios.get(
        `http://localhost:8080/assignments/${assignmentId}/user-submission`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentSubmission(submissionResponse.data);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 
              err.message || 
              t('assignmentSubmission.errors.submissionFailed'));
      setSubmissionStatus('error');
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md"
        >
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">{t('assignmentSubmission.errors.title')}</h3>
          </div>
          <p className="mb-4">{error}</p>
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 shadow-sm"
          >
            {t('assignmentSubmission.buttons.goBack')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8" dir={i18n.dir()}>
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

      <div className="max-w-4xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('assignmentSubmission.buttons.back')}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {t('assignmentSubmission.labels.description')}
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                    {assignment.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full shadow-sm">
                  <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-sm text-gray-700">
                    {t('assignmentSubmission.labels.due')}: {new Date(assignment.dueDate).toLocaleDateString()} {t('assignmentSubmission.labels.at')}{' '}
                    {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <motion.button 
                  onClick={downloadAssignmentFile}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full shadow-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{t('assignmentSubmission.buttons.download')}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {userRole === 'STUDENT' && studentSubmission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('assignmentSubmission.status.yourSubmission')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {t('assignmentSubmission.labels.submittedOn')}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(studentSubmission.submissionDate).toLocaleString()}
                  </p>
                </div>

                {studentSubmission.grade && (
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-blue-700 mb-2">
                      {t('assignmentSubmission.labels.grade')}
                    </h3>
                    <p className="text-blue-600 font-bold">
                      {studentSubmission.grade}/{assignment.totalMarks}
                    </p>
                  </div>
                )}
              </div>

              {studentSubmission.feedback && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-semibold text-blue-800">
                      {t('assignmentSubmission.labels.feedback')}
                    </h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {studentSubmission.feedback}
                  </p>
                  {studentSubmission.feedbackDate && (
                    <div className="text-xs text-gray-500 mt-2">
                      {t('assignmentSubmission.labels.feedbackDate')}: {new Date(studentSubmission.feedbackDate).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {t('assignmentSubmission.labels.yourSolution')}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-600 whitespace-pre-line">
                    {studentSubmission.solutionText || t('assignmentSubmission.messages.noTextSolution')}
                  </p>
                </div>
              </div>

              {studentSubmission.solutionFileUrl && (
                <motion.button
                  onClick={() => downloadStudentFile(studentSubmission.submissionId, 'your_solution')}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg shadow-sm"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  {t('assignmentSubmission.buttons.downloadSolution')}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {(userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('assignmentSubmission.labels.studentSubmissions')}
                </h2>
                <motion.button
                  onClick={() => setShowSubmissions(!showSubmissions)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium shadow-sm"
                >
                  {showSubmissions ? t('assignmentSubmission.buttons.hideSubmissions') : t('assignmentSubmission.buttons.showSubmissions')}
                </motion.button>
              </div>

              {showSubmissions && (
                <div className="space-y-6">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <motion.div 
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">
                              {submission.studentName || `${t('assignmentSubmission.labels.student')} ID: ${submission.studentId}`}
                            </span>
                            <div className="text-xs text-gray-500">
                              {t('assignmentSubmission.labels.submitted')}: {new Date(submission.submissionDate).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {submission.feedback && (
                          <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="text-sm font-semibold text-blue-700">
                                {t('assignmentSubmission.labels.yourFeedback')}
                              </h3>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">
                              {submission.feedback}
                            </p>
                            {submission.feedbackDate && (
                              <div className="text-xs text-gray-500 mt-2">
                                {t('assignmentSubmission.labels.addedOn')}: {new Date(submission.feedbackDate).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            {t('assignmentSubmission.labels.solutionText')}
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 whitespace-pre-line">
                              {submission.solutionText || t('assignmentSubmission.messages.noTextSolution')}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          onClick={() => downloadStudentFile(submission.id, submission.studentName || `student_${submission.studentId}`)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm mb-4 bg-blue-50 px-4 py-2 rounded-lg shadow-sm"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          {t('assignmentSubmission.buttons.downloadSolution')}
                        </motion.button>

                        <div className="mt-4 border-t pt-4">
                          <h3 className="text-sm font-medium mb-2">
                            {t('assignmentSubmission.labels.addFeedback')}
                          </h3>
                          <textarea
                            rows={3}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={t('assignmentSubmission.placeholders.feedback')}
                          />
                          <motion.button
                            onClick={() => submitFeedback(submission.id)}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                          >
                            {t('assignmentSubmission.buttons.submitFeedback')}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">
                        {t('assignmentSubmission.messages.noSubmissions')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {userRole === 'STUDENT' && (!studentSubmission || assignment.allowResubmissions) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
          >
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {studentSubmission ? t('assignmentSubmission.buttons.resubmit') : t('assignmentSubmission.buttons.submit')}
              </h2>

              {submissionStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    <p className="text-green-700">
                      {t('assignmentSubmission.status.success')}
                    </p>
                  </div>
                </motion.div>
              )}

              {submissionStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg"
                >
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-red-700">
                      {t('assignmentSubmission.status.error')}
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="solutionText" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('assignmentSubmission.labels.solutionText')}
                  </label>
                  <textarea
                    id="solutionText"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder={t('assignmentSubmission.placeholders.solutionText')}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('assignmentSubmission.labels.uploadFile')}
                  </label>
                  <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-3" />
                    <div className="flex text-sm text-gray-600 mb-2">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>{t('assignmentSubmission.placeholders.upload')}</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('assignmentSubmission.placeholders.fileTypes')}
                    </p>
                    {solutionFile && (
                      <div className="mt-3 flex items-center text-sm text-gray-600">
                        <PaperClipIcon className="h-4 w-4 mr-1" />
                        <span>{solutionFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm font-medium shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all"
                  >
                    <div className="flex items-center">
                      {studentSubmission ? (
                        <>
                          <PencilIcon className="h-5 w-5 mr-2" />
                          {t('assignmentSubmission.buttons.resubmit')}
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          {t('assignmentSubmission.buttons.submit')}
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {userRole === 'STUDENT' && studentSubmission && !assignment.allowResubmissions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-8 text-center"
          >
            <div className="bg-gray-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              {t('assignmentSubmission.status.completed')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('assignmentSubmission.messages.cannotResubmit')}
            </p>
            <motion.button
              onClick={() => navigate(`/courses/${assignment?.courseId}`)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              {t('assignmentSubmission.buttons.back')}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmission;