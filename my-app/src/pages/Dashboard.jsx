import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Box, Grid, Card, CardContent, 
  Avatar, IconButton, Divider, Menu, MenuItem, Badge,
  Popover, ListItemAvatar, Chip, Button, LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const Dashboard = () => {
  const { user, logout, isAuthenticated, updateUserProfile } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    instructors: 0,
    assignments: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [lessonProgress, setLessonProgress] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});

  // Add effect to update user profile when component mounts
  useEffect(() => {
    updateUserProfile();
  }, [updateUserProfile]);

  // Add debug logging for user data
  useEffect(() => {
    console.log('Current user data:', user);
  }, [user]);

  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (user?.role === 'STUDENT') {
        try {
          const response = await axios.get('http://localhost:8080/lessons/progress/student', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setLessonProgress(response.data);
        } catch (error) {
          console.error('Failed to fetch lesson progress:', error);
        }
      }
    };

    fetchLessonProgress();
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8080/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('فشل في جلب الإشعارات:', error);
      }
    };
  
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // تحديث كل 30 ثانية
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/courses/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecentCourses(response.data.slice(0, 5)); // Get last 5 courses
      } catch (error) {
        console.error('Failed to fetch recent courses:', error);
      }
    };

    const fetchCourseProgress = async () => {
      if (user?.role === 'STUDENT') {
        try {
          const response = await axios.get('http://localhost:8080/lessons/progress/student', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          // Calculate progress for each course
          const progressMap = {};
          response.data.forEach(progress => {
            if (!progressMap[progress.courseId]) {
              progressMap[progress.courseId] = {
                total: 0,
                completed: 0,
                title: progress.lessonTitle.split(' - ')[0] // Extract course title from lesson title
              };
            }
            progressMap[progress.courseId].total++;
            if (progress.completed) {
              progressMap[progress.courseId].completed++;
            }
          });
          
          setCourseProgress(progressMap);
        } catch (error) {
          console.error('Failed to fetch course progress:', error);
        }
      }
    };

    fetchRecentCourses();
    fetchCourseProgress();
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, read: true} : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:8080/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/courses">
          <ListItemIcon><SchoolIcon /></ListItemIcon>
          <ListItemText primary="Courses" />
        </ListItem>
      </List>
    </div>
  );

  const renderStudentDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Recent Courses
        </Typography>
      </Grid>
      {recentCourses.map((course) => (
        <Grid item xs={12} md={6} lg={4} key={course.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {course.description}
              </Typography>
              {courseProgress[course.id] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Progress: {Math.round((courseProgress[course.id].completed / courseProgress[course.id].total) * 100)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(courseProgress[course.id].completed / courseProgress[course.id].total) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/courses/${course.id}`}
                sx={{ mt: 2 }}
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderInstructorDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Recent Courses
        </Typography>
      </Grid>
      {recentCourses.map((course) => (
        <Grid item xs={12} md={6} lg={4} key={course.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {course.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/courses/${course.id}`}
                >
                  View Course
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to={`/courses/${course.id}/students`}
                >
                  View Progress
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderAdminDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Recent Courses
        </Typography>
      </Grid>
      {recentCourses.map((course) => (
        <Grid item xs={12} md={6} lg={4} key={course.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {course.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/courses/${course.id}`}
                >
                  View Course
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to={`/admin/courses/${course.id}`}
                >
                  Manage Course
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'black',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            LMS Dashboard
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationsClick}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Popover
  open={Boolean(notificationsAnchorEl)}
  anchorEl={notificationsAnchorEl}
  onClose={handleNotificationsClose}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
>
  <Box sx={{ width: 360, p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">Notifications</Typography>
      {unreadCount > 0 && (
        <Button size="small" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      )}
    </Box>
    <Divider />
   <List sx={{ maxHeight: 400, overflow: 'auto' }}>
  {notifications.length > 0 ? (
    notifications.map((notification) => (
      <ListItem 
        key={notification.id}
        sx={{ 
          backgroundColor: notification.read ? '#f9f9f9' : '#e3f2fd',
          borderLeft: notification.read ? 'none' : '4px solid #2196f3',
          mb: 1,
          borderRadius: 1
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <SchoolIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" fontWeight="bold">
              {notification.title}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2">
                {notification.message}
              </Typography>
              <Chip 
                label={notification.courseName}
                size="small"
                sx={{ mt: 1 }}
                color="primary"
              />
            </>
          }
        />
      </ListItem>
    ))
  ) : (
    <ListItem>
      <ListItemText 
        primary="لا توجد إشعارات حاليا"
        sx={{ textAlign: 'center', color: 'text.secondary' }}
      />
    </ListItem>
  )}
</List>
    <Divider />
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
      <Button 
        component={Link} 
        to="/notifications" 
        size="small"
        sx={{ color: 'primary.main' }}
      >
        View all notifications
      </Button>
    </Box>
  </Box>
</Popover>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                src={user?.profilePicture ? `http://localhost:8080/uploads/profile-pictures/${user.profilePicture}` : undefined}
                sx={{ 
                  bgcolor: user?.profilePicture ? 'transparent' : 'primary.main',
                  width: 32,
                  height: 32
                }}
              >
                {!user?.profilePicture && `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`}
              </Avatar>
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
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                UserProfile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - 240px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>

        {user?.role === 'STUDENT' && renderStudentDashboard()}
        {user?.role === 'INSTRUCTOR' && renderInstructorDashboard()}
        {user?.role === 'ADMIN' && renderAdminDashboard()}
      </Box>
    </Box>
  );
};

export default Dashboard;