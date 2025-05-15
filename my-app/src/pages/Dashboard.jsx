import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Box, Grid, Card, CardContent, 
  IconButton, Divider, Menu, MenuItem, Badge,
  Popover, Chip, Button, LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, isAuthenticated, updateUserProfile } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [recentCourses, setRecentCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});

  // Color Scheme
  const colors = {
    primary: '#3498db',
    secondary: '#e67e22',
    background: '#C7E2FC',
    textDark: '#2c3e50',
    textLight: '#7f8c8d',
    gradient: 'linear-gradient(to right, #3498db, #2ecc71)',
    white: '#ffffff',
    border: '#e0e0e0'
  };

  useEffect(() => {
    updateUserProfile();
  }, [updateUserProfile]);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/courses/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecentCourses(response.data.slice(-5));
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
          
          const progressMap = {};
          response.data.forEach(progress => {
            if (!progressMap[progress.courseId]) {
              progressMap[progress.courseId] = {
                total: 0,
                completed: 0,
                title: progress.lessonTitle.split(' - ')[0]
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

  const drawer = (
    <div>
      <Toolbar sx={{ bgcolor: colors.white }} />
      <Divider sx={{ bgcolor: colors.border }} />
      <List>
        <ListItem 
          button 
          component={Link} 
          to="/dashboard"
          sx={{ 
            '&:hover': { 
              bgcolor: '#f0f7ff',
              borderRadius: '12px',
              mx: 1
            },
            color: colors.textDark,
            py: 1.5,
            transition: 'all 0.3s ease'
          }}
        >
          <ListItemIcon sx={{ color: colors.primary, minWidth: '40px' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 500 
            }}
          />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/courses"
          sx={{ 
            '&:hover': { 
              bgcolor: '#f0f7ff',
              borderRadius: '12px',
              mx: 1
            },
            color: colors.textDark,
            py: 1.5,
            transition: 'all 0.3s ease'
          }}
        >
          <ListItemIcon sx={{ color: colors.primary, minWidth: '40px' }}>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Courses" 
            primaryTypographyProps={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 500 
            }}
          />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fa' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: colors.white,
          color: colors.textDark,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${colors.border}`,
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        <Toolbar>
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
              fontWeight: 700,
              color: colors.textDark,
              fontFamily: 'inherit'
            }}
          >
            LMS Dashboard
          </Typography>
          
          <div>
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationsClick}
              sx={{ color: colors.primary }}
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
                  <Typography variant="h6" sx={{ color: colors.textDark, fontFamily: 'Poppins, sans-serif' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Button 
                      size="small"
                      sx={{ 
                        color: colors.primary,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
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
                          bgcolor: notification.read ? '#f9f9f9' : '#e3f2fd',
                          borderLeft: notification.read ? 'none' : `4px solid ${colors.primary}`,
                          mb: 1,
                          borderRadius: '8px'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                color: colors.textDark,
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif'
                              }}
                            >
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: colors.textLight,
                                  fontFamily: 'Comic Neue, cursive'
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Chip 
                                label={notification.courseName}
                                size="small"
                                sx={{ 
                                  mt: 1,
                                  bgcolor: colors.primary,
                                  color: colors.white,
                                  fontFamily: 'Poppins, sans-serif'
                                }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText 
                        primary="No notifications available"
                        sx={{ 
                          textAlign: 'center', 
                          color: colors.textLight,
                          fontFamily: 'Comic Neue, cursive'
                        }}
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
                    sx={{ 
                      color: colors.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    View all notifications
                  </Button>
                </Box>
              </Box>
            </Popover>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              onClick={handleMenu}
              color="inherit"
              sx={{ color: colors.primary }}
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
                  minWidth: '200px'
                }
              }}
            >
              <MenuItem 
                onClick={handleProfileClick}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                <ListItemIcon sx={{ color: colors.textDark }}>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1" sx={{ color: colors.textDark }}>
                  User Profile
                </Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                <ListItemIcon sx={{ color: colors.textDark }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1" sx={{ color: colors.textDark }}>
                  Logout
                </Typography>
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              bgcolor: colors.white,
              borderRight: `1px solid ${colors.border}`
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              bgcolor: colors.white,
              borderRight: `1px solid ${colors.border}`
            },
          }}
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
          background: `linear-gradient(to bottom, ${colors.white}, ${colors.background})`,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            color: colors.textDark, 
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '2rem'
          }}
        >
          Welcome back, {user?.firstName}!
        </Typography>

        <Grid container spacing={3}>
          {recentCourses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card
                sx={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 8px 16px ${colors.primary}33`
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: colors.textDark, 
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.25rem'
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: colors.textLight, 
                      mb: 2,
                      fontFamily: 'Comic Neue, cursive',
                      lineHeight: 1.5,
                      minHeight: '60px'
                    }}
                  >
                    {course.description}
                  </Typography>
                  
                  {courseProgress[course.id] && (
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.secondary, 
                          mb: 1,
                          fontWeight: 500,
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      >
                        Progress: {Math.round((courseProgress[course.id].completed / courseProgress[course.id].total) * 100)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(courseProgress[course.id].completed / courseProgress[course.id].total) * 100}
                        sx={{ 
                          height: 10,
                          borderRadius: 5,
                          bgcolor: '#e0f2ff',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: colors.secondary,
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>
                  )}
                  
                  <Button
                    component={Link}
                    to={`/courses/${course.id}`}
                    variant="contained"
                    sx={{
                      mt: 2,
                      background: colors.gradient,
                      '&:hover': {
                        opacity: 0.9,
                        boxShadow: `0 4px 8px ${colors.primary}4D`
                      },
                      borderRadius: '12px',
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      fontFamily: 'Poppins, sans-serif',
                      width: '100%'
                    }}
                  >
                    {user?.role === 'STUDENT' ? 'Continue Learning' : 'View Course'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;