import { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import CourseFormModal from './CourseFormModal';
import AssignInstructorModal from './AssignInstructorModal';
import { AuthContext } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const drawerWidth = 240;
const collapsedWidth = 73;

const Courses = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Color Scheme
  const colors = {
    primary: '#3f51b5',
    secondary: '#4caf50',
    background: '#f5f7fa',
    cardBg: '#ffffff',
    textDark: '#2c3e50',
    textLight: '#7f8c8d',
    white: '#ffffff',
    border: '#e0e0e0',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    gradient: 'linear-gradient(to right, #3f51b5, #4caf50)'
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/courses';
      let params = {};

      if (user?.role === 'INSTRUCTOR') {
        url = 'http://localhost:8080/courses';
        params = { instructorId: user.id };
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        params
      });

      let filteredCourses = response.data;
      
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
        setError(t('courses.messages.serverError'));
      } else {
        setError(t('courses.messages.loadCoursesError'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, t]);

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
      setError(err.response?.data?.message || t('courses.messages.assignError'));
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
      setError(t('courses.messages.assignSelfError'));
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
      setError(t('courses.messages.createError'));
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
      setError(error.response?.data?.message || t('courses.messages.updateError'));
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
      setError(t('courses.messages.unenrollError'));
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
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(t('courses.messages.deleteError'));
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
      setError(t('courses.messages.enrollError'));
    }
  };

  const handleCourseClick = (courseId) => {
    if (enrolledCourses.includes(courseId) || user?.role !== 'STUDENT') {
      navigate(`/courses/${courseId}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: colors.background
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: `4px solid ${colors.primary}`,
            borderTopColor: 'transparent'
          }}
        />
      </Box>
    );
  }

  const drawer = (
    <Box>
      <Toolbar sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        minHeight: '64px !important',
        bgcolor: colors.white,
        borderBottom: `1px solid ${colors.border}`
      }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" noWrap sx={{ 
            fontWeight: 600,
            color: colors.primary
          }}>
            {t('app.name')}
          </Typography>
        )}
        <IconButton onClick={toggleSidebar} size="small">
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        <ListItem 
          button 
          component={Link} 
          to="/dashboard"
          sx={{ 
            borderRadius: '8px',
            mx: 1,
            mb: 0.5,
            py: 1,
            '&:hover': { 
              bgcolor: 'rgba(63, 81, 181, 0.1)'
            },
            '&.Mui-selected': {
              bgcolor: 'rgba(63, 81, 181, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: colors.textDark,
            minWidth: '40px',
            justifyContent: 'center'
          }}>
            <DashboardIcon />
          </ListItemIcon>
          {!sidebarCollapsed && (
            <ListItemText 
              primary={t('dashboard.menu.dashboard')} 
              primaryTypographyProps={{ 
                fontSize: '0.875rem',
                fontWeight: 500 
              }}
            />
          )}
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/courses"
          selected
          sx={{ 
            borderRadius: '8px',
            mx: 1,
            mb: 0.5,
            py: 1,
            '&:hover': { 
              bgcolor: 'rgba(63, 81, 181, 0.1)'
            },
            '&.Mui-selected': {
              bgcolor: 'rgba(63, 81, 181, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: colors.primary,
            minWidth: '40px',
            justifyContent: 'center'
          }}>
            <SchoolIcon />
          </ListItemIcon>
          {!sidebarCollapsed && (
            <ListItemText 
              primary={t('dashboard.menu.courses')} 
              primaryTypographyProps={{ 
                fontSize: '0.875rem',
                fontWeight: 500 
              }}
            />
          )}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: colors.background,
      minHeight: '100vh'
    }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedWidth : drawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedWidth : drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          color: colors.textDark,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' }, 
              color: colors.primary 
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: colors.textDark,
              fontSize: '1.25rem'
            }}
          >
            {user?.role === 'INSTRUCTOR' ? t('courses.titles.instructorCourses') : t('courses.titles.availableCourses')}
          </Typography>
          
          {/* Language Toggle */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mr: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '24px',
            p: '2px',
            border: `1px solid ${colors.border}`
          }}>
            <GlobeAltIcon style={{ width: 20, height: 20, color: colors.textLight, marginLeft: 8 }} />
            <Button
              onClick={() => changeLanguage('en')}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: i18n.language === 'en' ? 600 : 400,
                color: i18n.language === 'en' ? colors.primary : colors.textLight,
                textTransform: 'uppercase'
              }}
            >
              EN
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Button
              onClick={() => changeLanguage('ar')}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: i18n.language === 'ar' ? 600 : 400,
                color: i18n.language === 'ar' ? colors.primary : colors.textLight,
                textTransform: 'uppercase'
              }}
            >
              AR
            </Button>
          </Box>

          {/* Profile Menu */}
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                color: colors.primary,
                '&:hover': {
                  bgcolor: 'rgba(63, 81, 181, 0.1)'
                }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  minWidth: '200px',
                  border: `1px solid ${colors.border}`
                }
              }}
            >
              <MenuItem 
                onClick={handleProfileClick}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(63, 81, 181, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: colors.primary }}>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">{t('dashboard.menu.profile')}</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: colors.error }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">{t('dashboard.menu.logout')}</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { sm: sidebarCollapsed ? collapsedWidth : drawerWidth },
          flexShrink: { sm: 0 },
          '& .MuiDrawer-paper': {
            width: { sm: sidebarCollapsed ? collapsedWidth : drawerWidth },
            boxSizing: 'border-box',
            bgcolor: colors.white,
            borderRight: `1px solid ${colors.border}`,
            transition: 'width 0.2s ease'
          }
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              bgcolor: colors.white,
              borderRight: `1px solid ${colors.border}`
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              width: { sm: sidebarCollapsed ? collapsedWidth : drawerWidth },
              bgcolor: colors.white,
              borderRight: `1px solid ${colors.border}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            sm: `calc(100% - ${sidebarCollapsed ? collapsedWidth : drawerWidth}px)`
          },
          ml: { sm: `${sidebarCollapsed ? collapsedWidth : drawerWidth}px` },
          mt: '64px',
          pb: { xs: '56px', sm: 3 }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BookOpenIcon style={{ width: 36, height: 36, color: colors.primary }} />
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  background: colors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {user?.role === 'INSTRUCTOR' ? t('courses.titles.instructorCourses') : t('courses.titles.availableCourses')}
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textLight }}>
                  {user?.role === 'INSTRUCTOR' ? t('courses.subtitles.instructorSubtitle') : t('courses.subtitles.availableSubtitle')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowPathIcon style={{ 
                  width: 20, 
                  height: 20,
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }} />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px'
                }}
              >
                {t('courses.buttons.refresh')}
              </Button>

              {user?.role === 'ADMIN' && (
                <Button
                  variant="contained"
                  startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                  onClick={() => {
                    setEditingCourse(null);
                    setIsModalOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    bgcolor: colors.primary,
                    '&:hover': {
                      bgcolor: '#303f9f'
                    }
                  }}
                >
                  {t('courses.buttons.addCourse')}
                </Button>
              )}
            </Box>
          </Box>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Paper elevation={0} sx={{ 
                p: 2, 
                mb: 3,
                bgcolor: '#ffeeee',
                borderLeft: `4px solid ${colors.error}`
              }}>
                <Typography variant="body1" sx={{ color: colors.error }}>
                  {error}
                </Typography>
              </Paper>
            </motion.div>
          )}

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Paper elevation={0} sx={{ 
                p: 6,
                textAlign: 'center',
                bgcolor: colors.cardBg,
                borderRadius: '16px'
              }}>
                <AcademicCapIcon style={{ 
                  width: 64, 
                  height: 64, 
                  color: colors.textLight,
                  margin: '0 auto 16px'
                }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  {user?.role === 'INSTRUCTOR' ? t('courses.messages.noCoursesInstructor') : t('courses.messages.noCoursesAvailable')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.textLight,
                  mb: 3
                }}>
                  {user?.role === 'INSTRUCTOR' ? t('courses.messages.contactAdmin') : t('courses.messages.checkBack')}
                </Typography>
                {user?.role === 'ADMIN' && (
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: colors.primary,
                      '&:hover': {
                        bgcolor: '#303f9f'
                      }
                    }}
                  >
                    {t('courses.buttons.createFirstCourse')}
                  </Button>
                )}
              </Paper>
            </motion.div>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3
            }}>
              {courses.map((course) => {
                const isEnrolled = enrolledCourses.includes(course.id);
                const isAdmin = user?.role === 'ADMIN';

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <Paper elevation={1} sx={{ 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)'
                      },
                      cursor: isEnrolled || user?.role !== 'STUDENT' ? 'pointer' : 'default'
                    }} onClick={() => handleCourseClick(course.id)}>
                      {isAdmin && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          gap: 1,
                          zIndex: 1
                        }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCourse(course);
                              setIsModalOpen(true);
                            }}
                            sx={{ 
                              bgcolor: 'rgba(63, 81, 181, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(63, 81, 181, 0.2)'
                              }
                            }}
                            title={t('courses.buttons.edit')}
                          >
                            <PencilIcon style={{ width: 16, height: 16, color: colors.primary }} />
                          </IconButton>

                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.id);
                            }}
                            sx={{ 
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.2)'
                              }
                            }}
                            title={t('courses.buttons.delete')}
                          >
                            <TrashIcon style={{ width: 16, height: 16, color: colors.error }} />
                          </IconButton>

                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentCourse(course);
                              setIsAssignModalOpen(true);
                            }}
                            sx={{ 
                              bgcolor: 'rgba(255, 152, 0, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 152, 0, 0.2)'
                              }
                            }}
                            title={t('courses.buttons.assignInstructor')}
                          >
                            <UserPlusIcon style={{ width: 16, height: 16, color: colors.warning }} />
                          </IconButton>
                        </Box>
                      )}

                      <Box sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={course.category || t('courses.labels.general')} 
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(63, 81, 181, 0.1)',
                              color: colors.primary
                            }}
                          />
                        </Box>

                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          mb: 2
                        }}>
                          {course.title}
                        </Typography>

                        <Typography variant="body2" sx={{ 
                          color: colors.textLight,
                          mb: 3,
                          height: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {course.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: 'rgba(63, 81, 181, 0.1)',
                              color: colors.primary,
                              width: 36,
                              height: 36
                            }}>
                              {course.instructor?.firstName?.charAt(0) || 'I'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {course.instructor?.firstName ? 
                                  `${course.instructor.firstName}${course.instructor.lastName ? ' ' + course.instructor.lastName : ''}` 
                                  : t('courses.labels.noInstructor')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textLight }}>
                                {t('courses.labels.instructor')}
                              </Typography>
                            </Box>
                          </Box>

                          {user?.role === 'STUDENT' && (
                            <Button
                              variant={isEnrolled ? 'outlined' : 'contained'}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                isEnrolled ? handleUnenroll(course.id) : handleEnroll(course.id);
                              }}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: isEnrolled ? 'transparent' : colors.success,
                                color: isEnrolled ? colors.error : colors.white,
                                borderColor: isEnrolled ? colors.error : 'transparent',
                                '&:hover': {
                                  bgcolor: isEnrolled ? 'rgba(244, 67, 54, 0.1)' : '#43a047'
                                }
                              }}
                            >
                              {isEnrolled ? t('courses.buttons.unEnroll') : t('courses.buttons.enroll')}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                );
              })}
            </Box>
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
          language={i18n.language}
        />

        <AssignInstructorModal
          isOpen={isAssignModalOpen}
          setIsOpen={setIsAssignModalOpen}
          onAssign={handleAssignInstructor}
          course={currentCourse}
          instructors={instructors}
          onClose={() => setIsAssignModalOpen(false)}
          language={i18n.language}
        />

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmDeleteCourse}
          title={t('courses.titles.deleteCourse')}
          message={t('courses.messages.deleteConfirm')}
          cancelText={t('courses.buttons.cancel')}
          confirmText={t('courses.buttons.confirm')}
          language={i18n.language}
        />
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: sidebarCollapsed ? collapsedWidth : drawerWidth },
          right: 0,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${colors.border}`,
          py: 1,
          px: 2,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
          display: { sm: 'none' }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <Button
            component={Link}
            to="/dashboard"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: colors.textDark,
              minWidth: 'auto',
              '&:hover': {
                color: colors.primary,
                bgcolor: 'transparent'
              },
              px: 2,
              py: 1
            }}
          >
            <DashboardIcon sx={{ fontSize: '1.25rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {t('dashboard.menu.dashboard')}
            </Typography>
          </Button>

          <Button
            component={Link}
            to="/courses"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: colors.primary,
              minWidth: 'auto',
              '&:hover': {
                bgcolor: 'transparent'
              },
              px: 2,
              py: 1
            }}
          >
            <SchoolIcon sx={{ fontSize: '1.25rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {t('dashboard.menu.courses')}
            </Typography>
          </Button>

          <Button
            onClick={handleLogout}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: colors.textDark,
              minWidth: 'auto',
              '&:hover': {
                color: colors.error,
                bgcolor: 'transparent'
              },
              px: 2,
              py: 1
            }}
          >
            <LogoutIcon sx={{ fontSize: '1.25rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {t('dashboard.menu.logout')}
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Courses;