import { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import CourseFormModal from './CourseFormModal.js';
import AssignInstructorModal from './AssignInstructorModal.js';
import { AuthContext } from '../context/AuthContext.js';
import ConfirmDialog from '../components/ConfirmDialog';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

 const fetchCourses = useCallback(async () => {
  try {
    setLoading(true);
    let url = 'http://localhost:8080/courses';
    let params = {};

    if (user?.role === 'INSTRUCTOR') {
      // الطريقتين: إما نقطة نهاية خاصة أو فلترة من الخادم
      url = 'http://localhost:8080/courses';
      params = { instructorId: user.id }; // أرسل معرّف المدرس كبارامتر
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      params
    });

    let filteredCourses = response.data;
    
    // إذا لم يكن هناك دعم للفلترة من الخادم، نقوم بالفلترة من الواجهة
    if (user?.role === 'INSTRUCTOR') {
      filteredCourses = response.data.filter(course => 
        course.instructor && course.instructor.id === user.id
      );
    }
    
    setCourses(filteredCourses);
    setError(null);
  } catch (err) {
    console.error('Error fetching courses:', err);
    if (err.response?.status === 500) {
      setError('Server error. Please contact administrator.');
    } else {
      setError('Failed to load courses. Please try again later.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [user]);

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/courses/users/instructors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setInstructors(response.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    if (user?.role === 'STUDENT') {
      try {
        const res = await axios.get('http://localhost:8080/enrollments/my-courses', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setEnrolledCourses(res.data.map(e => e.courseId));
      } catch (err) {
        console.error('Error fetching enrollments:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    if (user?.role === 'ADMIN') {
      fetchInstructors();
    }
  }, [fetchCourses, fetchEnrollments, fetchInstructors, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
    if (user?.role === 'STUDENT') {
      fetchEnrollments();
    }
    if (user?.role === 'ADMIN') {
      fetchInstructors();
    }
  };

  const handleAssignInstructor = async (courseId, instructorId) => {
    try {
      await axios.post('http://localhost:8080/courses/assign-instructor', {
        courseId,
        instructorId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchCourses();
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error('Assigning instructor failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to assign instructor. Please check the instructor ID and try again.');
    }
  };
  
  const handleAssignSelf = async (courseId) => {
    try {
      await axios.post('http://localhost:8080/courses/assign-self', {
        courseId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchCourses();
    } catch (err) {
      console.error('Assign self failed:', err);
      setError('Failed to assign yourself to this course. You might already be assigned or the course doesn\'t exist.');
    }
  };
  
  const handleCreateCourse = async (courseData) => {
    try {
      await axios.post('http://localhost:8080/courses', courseData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchCourses();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course. Please try again.');
    }
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      await axios.put(`http://localhost:8080/courses/${editingCourse.id}`, courseData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchCourses();
      setEditingCourse(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to update course. Please try again.');
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await axios.delete(`http://localhost:8080/enrollments/unenroll`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        data: { courseId }
      });
      fetchEnrollments();
    } catch (err) {
      console.error('Unenrollment failed:', err);
      setError('Failed to unenroll from course.');
    }
  };

  const handleDeleteCourse = (courseId) => {
    setCourseToDelete(courseId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/courses/${courseToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(courses.filter(course => course.id !== courseToDelete));
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`http://localhost:8080/enrollments/enroll`, { courseId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchEnrollments();
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError('Failed to enroll in course. You might already be enrolled or the course is full.');
    }
  };

  const handleCourseClick = (courseId) => {
    if (enrolledCourses.includes(courseId) || user?.role !== 'STUDENT') {
      navigate(`/courses/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpenIcon className="h-9 w-9 text-indigo-600" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user?.role === 'INSTRUCTOR' ? 'My Teaching Courses' : 'Available Courses'}
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              {user?.role === 'INSTRUCTOR' 
                ? 'Courses assigned to you' 
                : 'Browse and manage all available learning programs'}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            {user?.role === 'ADMIN' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingCourse(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-indigo-700 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Add Course
              </motion.button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm"
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-10 text-center"
          >
            <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {user?.role === 'INSTRUCTOR' ? 'No courses assigned to you yet' : 'No courses available'}
            </h3>
            <p className="mt-2 text-gray-500">
              {user?.role === 'INSTRUCTOR' 
                ? 'Please contact administrator to be assigned to courses' 
                : 'Check back later or contact support for more information.'}
            </p>
            {user?.role === 'ADMIN' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-all duration-200"
              >
                Create First Course
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course.id);
              const isAdmin = user?.role === 'ADMIN';

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 relative ${
                    isEnrolled || user?.role !== 'STUDENT' ? 'cursor-pointer hover:shadow-xl' : ''
                  }`}
                  onClick={() => handleCourseClick(course.id)}
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCourse(course);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm transition-colors"
                        title="Edit Course"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm transition-colors"
                        title="Delete Course"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCourse(course);
                          setIsAssignModalOpen(true);
                        }}
                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 shadow-sm transition-colors"
                        title="Assign Instructor"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                        {course.category || 'General'}
                      </span>
                     
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>

                    <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed">{course.description}</p>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium shadow-inner">
                          {course.instructor?.firstName?.charAt(0) || 'I'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700">
                            {course.instructor?.firstName ? 
                              `${course.instructor.firstName}${course.instructor.lastName ? ' ' + course.instructor.lastName : ''}` 
                              : 'No instructor'}
                          </p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {user?.role === 'STUDENT' && (
                          isEnrolled ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnenroll(course.id);
                              }}
                              className="px-4 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm shadow-sm transition-colors"
                            >
                              Unenroll
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnroll(course.id);
                              }}
                              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm shadow-sm transition-colors"
                            >
                              Enroll
                            </motion.button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <CourseFormModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onCreate={handleCreateCourse}
        onUpdate={handleUpdateCourse}
        course={editingCourse}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
      />

      <AssignInstructorModal
        isOpen={isAssignModalOpen}
        setIsOpen={setIsAssignModalOpen}
        onAssign={handleAssignInstructor}
        course={currentCourse}
        instructors={instructors}
        onClose={() => setIsAssignModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
    </div>
  );
};

export default Courses;