import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeftIcon,
  PlusCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [],
    timeLimit: 30,
    closeTime: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', ''],
    correctAnswer: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 5) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = [...currentQuestion.options];
      newOptions.splice(index, 1);
      
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer === prev.options[index] ? '' : prev.correctAnswer
      }));
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      setError('Question text cannot be empty');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    if (!currentQuestion.correctAnswer) {
      setError('Please select a correct answer');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));

    setCurrentQuestion({
      text: '',
      options: ['', ''],
      correctAnswer: ''
    });
    setError('');
  };

  const removeQuestion = (index) => {
    const newQuestions = [...quizData.questions];
    newQuestions.splice(index, 1);
    setQuizData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const submitQuiz = async () => {
    if (!quizData.title.trim()) {
      setError('Quiz title cannot be empty');
      return;
    }

    if (quizData.questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        title: quizData.title,
        description: quizData.description,
        courseId: courseId,
        questions: quizData.questions.map(q => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        timeLimit: quizData.timeLimit,
        closeTime: quizData.closeTime || null
      };

      await axios.post('http://localhost:8080/api/quizzes', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Course
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200/50"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Create New Quiz</h1>
                <p className="text-indigo-100 opacity-90">Design an engaging quiz for your students</p>
              </div>
              <div className="bg-white/10 p-2 rounded-full">
                <AcademicCapIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Quiz Info Section */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)*</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="timeLimit"
                      min="1"
                      value={quizData.timeLimit}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleQuizChange}
                  rows={3}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  placeholder="Enter quiz description (optional)"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Close Date (optional)</label>
                <input
                  type="datetime-local"
                  name="closeTime"
                  value={quizData.closeTime}
                  onChange={handleQuizChange}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                />
              </motion.div>

              {/* Questions Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t pt-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <PencilIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  Quiz Questions
                </h2>

                <div className="space-y-6">
                  {quizData.questions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <span className="bg-indigo-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">{question.text}</p>
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`p-2 rounded-lg ${question.correctAnswer === option ? 'bg-green-100 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2">{optIndex + 1}.</span>
                                      <span>{option}</span>
                                      {question.correctAnswer === option && (
                                        <CheckCircleIcon className="h-4 w-4 ml-2 text-green-500" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 p-1 ml-3"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Question Form */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm"
                  >
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Text*</label>
                      <input
                        type="text"
                        name="text"
                        value={currentQuestion.text}
                        onChange={handleQuestionChange}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Options*</label>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ x: 3 }}
                            className="flex items-center space-x-3"
                          >
                            <div className="bg-indigo-100 text-indigo-800 rounded-lg w-8 h-8 flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                              placeholder={`Option ${index + 1}`}
                            />
                            <motion.button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-500 hover:text-red-700 p-2"
                              disabled={currentQuestion.options.length <= 2}
                              whileTap={{ scale: 0.9 }}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                      {currentQuestion.options.length < 5 && (
                        <motion.button
                          type="button"
                          onClick={addOption}
                          className="mt-3 flex items-center text-indigo-600 text-sm font-medium"
                          whileHover={{ x: 3 }}
                        >
                          <PlusCircleIcon className="h-5 w-5 mr-2" />
                          Add Option
                        </motion.button>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer*</label>
                      <select
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options.map((option, index) => (
                          option && (
                            <option key={index} value={option}>
                              Option {index + 1}: {option}
                            </option>
                          )
                        ))}
                      </select>
                    </div>

                    <motion.button
                      type="button"
                      onClick={addQuestion}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center shadow-lg"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-2" />
                      Add Question
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
                >
                  <p className="text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end space-x-4 pt-6 border-t"
              >
                <motion.button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 shadow-sm"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={submitQuiz}
                  disabled={isSubmitting || quizData.questions.length === 0}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center shadow-lg ${
                    isSubmitting || quizData.questions.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                  whileHover={
                    !isSubmitting && quizData.questions.length > 0 
                      ? { y: -2 } 
                      : {}
                  }
                  whileTap={
                    !isSubmitting && quizData.questions.length > 0 
                      ? { scale: 0.98 } 
                      : {}
                  }
                >
                  {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuiz;