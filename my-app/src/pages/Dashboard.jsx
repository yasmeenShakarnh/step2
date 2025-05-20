import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Box, Grid, Card, CardContent, 
  IconButton, Divider, Menu, MenuItem, Badge,
  Popover, Chip, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Container, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel,
  Tooltip, Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext.js';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    role: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [roleFilter, setRoleFilter] = useState('ALL');
  const navigate = useNavigate();

  // Color Scheme
  const colors = {
    primary: '#3498db', // Blue
    secondary: '#2ecc71', // Green
    background: '#f8f9fa',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    textDark: '#2c3e50',
    textLight: '#7f8c8d',
    white: '#ffffff',
    border: '#e0e0e0',
    success: '#2ecc71', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    gradient: 'linear-gradient(to right, #3498db, #2ecc71)',
    iconBg: {
      primary: 'rgba(52, 152, 219, 0.1)',
      secondary: 'rgba(46, 204, 113, 0.1)',
      success: 'rgba(46, 204, 113, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      error: 'rgba(239, 68, 68, 0.1)'
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (user?.role === 'ADMIN') {
          try {
          const [statsRes, usersRes] = await Promise.all([
            axios.get('http://localhost:8080/admin/stats', {
                headers,
                validateStatus: function (status) {
                  return status < 500;
                }
              }),
              axios.get('http://localhost:8080/admin/users', { 
                headers,
                validateStatus: function (status) {
                  return status < 500;
                }
            })
          ]);

            if (statsRes.status === 401 || usersRes.status === 401) {
              console.error('Authentication failed');
              localStorage.removeItem('accessToken');
              navigate('/login');
              return;
            }

            if (statsRes.status === 200) {
          setStats(statsRes.data);
            } else {
              console.error('Error fetching stats:', statsRes.data);
            }

            if (usersRes.status === 200) {
          setUsers(usersRes.data);
            } else {
              console.error('Error fetching users:', usersRes.data);
            }
          } catch (error) {
            console.error('Error fetching admin data:', error.response?.data || error.message);
            if (error.response?.status === 401) {
              localStorage.removeItem('accessToken');
              navigate('/login');
            }
          }
        }
        else if (user?.role === 'INSTRUCTOR') {
          try {
            console.log('Fetching instructor data...');
            const [coursesRes, studentsRes] = await Promise.all([
              axios.get('http://localhost:8080/courses/instructor', {
                headers
              }),
              axios.get('http://localhost:8080/courses/instructor/students', {
                headers
              })
            ]);

            console.log('Courses response:', coursesRes);
            console.log('Students response:', studentsRes);

            if (coursesRes.status === 200) {
              setCourses(coursesRes.data);
            } else {
              console.error('Error fetching instructor courses:', coursesRes.data);
              setError('Failed to fetch courses: ' + (coursesRes.data?.message || 'Unknown error'));
            }

            if (studentsRes.status === 200) {
              setStudents(studentsRes.data);
            } else {
              console.error('Error fetching instructor students:', studentsRes.data);
              setError('Failed to fetch students: ' + (studentsRes.data?.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Error fetching instructor data:', error);
            setError('Failed to fetch instructor data: ' + (error.response?.data?.message || error.message));
            if (error.response?.status === 401) {
              localStorage.removeItem('accessToken');
              navigate('/login');
            }
          }
        }
 else if (user?.role === 'STUDENT') {
  try {
    console.log('Fetching student courses...');
    const enrollmentsRes = await axios.get('http://localhost:8080/enrollments/my-courses', {
      headers
    });

    console.log('Raw enrollments data:', enrollmentsRes.data);
    
    if (enrollmentsRes.status === 200) {
      const coursesData = enrollmentsRes.data.map(e => ({
        id: e.courseId, // استخدام courseId بدلاً من id
        enrollmentId: e.id, // معرف التسجيل
        name: e.courseTitle || `Course ${e.courseId}`, // استخدام courseTitle بدلاً من course.name
        // لا توجد بيانات المدرس في الرد، لذا نستخدم قيم افتراضية
        instructorFirstName: 'Unknown',
        instructorLastName: 'Instructor',
        instructorId: null,
        completed: e.completed,
        enrolledAt: e.enrolledAt,
        rawData: e // حفظ البيانات الخام لأغراض التصحيح
      }));

      console.log('Processed courses data:', coursesData);
      setCourses(coursesData);
    } else {
      console.error('Error response:', enrollmentsRes);
      setError('Failed to fetch courses: ' + (enrollmentsRes.data?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    setError('Failed to fetch courses: ' + (error.response?.data?.message || error.message));
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  }
}
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('An unexpected error occurred: ' + error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      }
    };

   if (user && user.role) { // تأكد من وجود user و role
    fetchData();
  }
}, [user?.role, navigate]);
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

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditFormData({
      firstName: '',
      lastName: '',
      role: ''
    });
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      if (!editFormData.firstName || !editFormData.lastName) {
        setError('All fields are required');
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/admin/users/${selectedUser.id}`,
        {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          role: selectedUser.role
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, firstName: editFormData.firstName, lastName: editFormData.lastName }
            : user
        ));
        handleEditClose();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Error updating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(
        `http://localhost:8080/admin/users/${userToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 204) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        handleDeleteClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting user');
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setUsers(sortedUsers);
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter === 'ALL') return true;
    return user.role === roleFilter;
  });

  const drawer = (
    <div>
      <Toolbar sx={{ 
        bgcolor: colors.white,
        borderBottom: `1px solid ${colors.border}`,
        height: '80px'
      }} />
      <Divider sx={{ bgcolor: colors.border }} />
      <List sx={{ px: 2, py: 1 }}>
        <ListItem 
          button 
          component={Link} 
          to="/dashboard"
          sx={{ 
            '&:hover': { 
              bgcolor: colors.iconBg.primary,
              borderRadius: '12px',
              mx: 1
            },
            color: colors.textDark,
            py: 1.5,
            transition: 'all 0.3s ease',
            mb: 1
          }}
        >
          <ListItemIcon sx={{ 
            color: colors.primary, 
            minWidth: '40px',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem'
            }
          }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ 
              fontSize: '1rem',
              fontWeight: 600 
            }}
          />
        </ListItem>
        <ListItem 
          button 
          component={Link} 
          to="/courses"
          sx={{ 
            '&:hover': { 
              bgcolor: colors.iconBg.primary,
              borderRadius: '12px',
              mx: 1
            },
            color: colors.textDark,
            py: 1.5,
            transition: 'all 0.3s ease'
          }}
        >
          <ListItemIcon sx={{ 
            color: colors.primary, 
            minWidth: '40px',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem'
            }
          }}>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Courses" 
            primaryTypographyProps={{ 
              fontSize: '1rem',
              fontWeight: 600 
            }}
          />
        </ListItem>
      </List>
    </div>
  );

  const renderAdminDashboard = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.cardBg, 
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
              '& .icon-container': {
                transform: 'scale(1.1)',
                bgcolor: colors.iconBg.primary
              }
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box className="icon-container" sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: colors.iconBg.primary,
                  mr: 2,
                  transition: 'all 0.3s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ 
                    color: colors.primary,
                    fontSize: '2rem'
                  }} />
              </Box>
                <Typography variant="h6" sx={{ 
                  color: colors.textDark, 
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}>
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.primary, 
                mb: 2,
                fontWeight: 700,
                fontSize: '2.5rem',
                letterSpacing: '-0.5px'
              }}>
                {stats.totalUsers}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  label={`Students: ${stats.studentCount}`} 
                  variant="outlined" 
                  sx={{ 
                    borderColor: colors.primary,
                    '& .MuiChip-label': {
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '&:hover': {
                      bgcolor: colors.iconBg.primary
                    }
                  }}
                />
                <Chip
                  label={`Instructors: ${stats.instructorCount}`}
                  variant="outlined"
                  sx={{ 
                    borderColor: colors.secondary,
                    '& .MuiChip-label': {
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '&:hover': {
                      bgcolor: colors.iconBg.secondary
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.cardBg, 
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
              '& .icon-container': {
                transform: 'scale(1.1)',
                bgcolor: colors.iconBg.secondary
              }
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box className="icon-container" sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: colors.iconBg.secondary,
                  mr: 2,
                  transition: 'all 0.3s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClassIcon sx={{ 
                    color: colors.secondary,
                    fontSize: '2rem'
                  }} />
              </Box>
                <Typography variant="h6" sx={{ 
                  color: colors.textDark, 
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}>
                  Total Courses
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.secondary,
                fontWeight: 700,
                fontSize: '2.5rem',
                letterSpacing: '-0.5px'
              }}>
                {stats.courseCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2, 
            bgcolor: colors.cardBg, 
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
              '& .icon-container': {
                transform: 'scale(1.1)',
                bgcolor: colors.iconBg.success
              }
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box className="icon-container" sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: colors.iconBg.success,
                  mr: 2,
                  transition: 'all 0.3s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AssignmentIcon sx={{ 
                    color: colors.success,
                    fontSize: '2rem'
                  }} />
              </Box>
                <Typography variant="h6" sx={{ 
                  color: colors.textDark, 
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}>
                  Active Enrollments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.success,
                fontWeight: 700,
                fontSize: '2.5rem',
                letterSpacing: '-0.5px'
              }}>
                {stats.enrollmentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: colors.cardBg,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="h6" sx={{ 
          color: colors.textDark,
          fontWeight: 600,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: '8px', 
            bgcolor: colors.iconBg.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PeopleIcon sx={{ color: colors.primary }} />
          </Box>
          User Management
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{
              bgcolor: colors.white,
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary
              },
              '& .MuiSelect-select': {
                py: 1.5,
                fontWeight: 500
              }
            }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 2,
          borderRadius: '8px',
          '& .MuiAlert-icon': {
            color: colors.error
          },
          '& .MuiAlert-message': {
            fontWeight: 500
          }
        }}>
          {error}
        </Alert>
      )}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  color: '#2c3e50',
                fontWeight: 600,
                  borderBottom: '2px solid rgba(52, 152, 219, 0.2)',
                  height: '64px',
                  verticalAlign: 'middle'
                }}
              >
                Name
              </TableCell>
              
              <TableCell 
                sx={{ 
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  color: '#2c3e50',
                  fontWeight: 600,
                  borderBottom: '2px solid rgba(52, 152, 219, 0.2)',
                  height: '64px',
                  verticalAlign: 'middle'
                }}
              >
                Role
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  color: '#2c3e50',
                  fontWeight: 600,
                  borderBottom: '2px solid rgba(52, 152, 219, 0.2)',
                  height: '64px',
                  verticalAlign: 'middle'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id} 
                sx={{ 
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.04)'
                  }
                }}
              >
                <TableCell 
                  sx={{ 
                    height: '64px',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: user.role === 'INSTRUCTOR' ? '#2ecc71' : 
                                user.role === 'ADMIN' ? '#3498db' : colors.border,
                        width: 40,
                        height: 40
                      }}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell 
                  sx={{ 
                    height: '64px',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                    minWidth: '120px'
                  }}
                >
                  <Chip 
                    label={user.role} 
                    sx={{ 
                      backgroundColor: user.role === 'INSTRUCTOR' ? '#2ecc71' : 
                                      user.role === 'ADMIN' ? '#3498db' : colors.border,
                      color: user.role === 'STUDENT' ? colors.textDark : 'white',
                      height: '32px',
                      width: '100%',
                      '& .MuiChip-label': {
                        fontSize: '0.875rem',
                        fontWeight: 500
                      },
                      '&:hover': {
                        backgroundColor: user.role === 'INSTRUCTOR' ? '#27ae60' : 
                                       user.role === 'ADMIN' ? '#2980b9' : 'rgba(224, 224, 224, 0.5)'
                      }
                    }}
                  />
                </TableCell>
                <TableCell 
                  align="right"
                        sx={{
                    height: '64px',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                    minWidth: '100px'
                  }}
                >
                  <IconButton size="small" onClick={() => handleEditClick(user)}>
                    <EditIcon sx={{ color: '#3498db' }} />
                      </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon sx={{ color: '#e74c3c' }} />
                      </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
              fullWidth
              required
              error={!editFormData.firstName}
              helperText={!editFormData.firstName ? 'First name is required' : ''}
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
              fullWidth
              required
              error={!editFormData.lastName}
              helperText={!editFormData.lastName ? 'Last name is required' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            disabled={loading || !editFormData.firstName || !editFormData.lastName}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const renderInstructorDashboard = () => (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Counters */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  mr: 2
                }}>
                  <SchoolIcon sx={{ color: colors.primary }} />
                </Box>
                <Typography variant="h6" sx={{ color: colors.textDark, fontWeight: 600 }}>
                Courses Taught
              </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.primary,
                fontWeight: 700,
                fontSize: '2.5rem'
              }}>
                {courses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: 'rgba(124, 58, 237, 0.1)',
                  mr: 2
                }}>
                  <PeopleIcon sx={{ color: colors.secondary }} />
                </Box>
                <Typography variant="h6" sx={{ color: colors.textDark, fontWeight: 600 }}>
                Registered Students
              </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.secondary,
                fontWeight: 700,
                fontSize: '2.5rem'
              }}>
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Courses Table */}
        <Grid item xs={12}>
          <Card sx={{ 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                color: colors.textDark,
                fontWeight: 600,
                mb: 2
              }}>
                My Courses
              </Typography>
              <TableContainer component={Paper} sx={{ 
                mt: 2,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'none',
                border: `1px solid ${colors.border}`
              }}>
  <Table>
    <TableHead>
                    <TableRow sx={{ 
                      bgcolor: colors.background,
                      '& th': {
                        borderBottom: `2px solid ${colors.border}`,
                        py: 2,
                        fontWeight: 600,
                        color: colors.textDark,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }
                    }}>
        <TableCell>Course Name</TableCell>
        <TableCell>Instructor</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {courses.map((course) => (
                      <TableRow 
                        key={course.id}
                        hover
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            bgcolor: 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:last-child td': { 
                            borderBottom: 0 
                          },
                          '& td': {
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                            color: colors.textDark,
                            fontSize: '0.95rem'
                          },
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: '8px', 
                              bgcolor: 'rgba(37, 99, 235, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <ClassIcon sx={{ color: colors.primary }} />
                            </Box>
                            {course.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: '8px', 
                              bgcolor: 'rgba(124, 58, 237, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <AccountCircleIcon sx={{ color: colors.secondary }} />
                            </Box>
                            {`${course.instructorFirstName} ${course.instructorLastName}`}
                          </Box>
                        </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStudentDashboard = () => (
  <Box sx={{ flexGrow: 1, p: 3 }}>
    <Grid container spacing={3}>
      {/* Counters */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%', 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
            }
        }}>
          <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  mr: 2
                }}>
                  <SchoolIcon sx={{ color: colors.primary }} />
                </Box>
                <Typography variant="h6" sx={{ color: colors.textDark, fontWeight: 600 }}>
              Professors
            </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.primary,
                fontWeight: 700,
                fontSize: '2.5rem'
              }}>
              {new Set(courses.map(course => course.instructorId)).size}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%', 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
            }
        }}>
          <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  bgcolor: 'rgba(124, 58, 237, 0.1)',
                  mr: 2
                }}>
                  <ClassIcon sx={{ color: colors.secondary }} />
                </Box>
                <Typography variant="h6" sx={{ color: colors.textDark, fontWeight: 600 }}>
              My Courses
            </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                color: colors.secondary,
                fontWeight: 700,
                fontSize: '2.5rem'
              }}>
              {courses.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Courses List */}
      <Grid item xs={12}>
        <Card sx={{ 
            bgcolor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.border}`
        }}>
          <CardContent>
              <Typography variant="h6" sx={{ 
                color: colors.textDark,
                fontWeight: 600,
                mb: 2
              }}>
              My Courses
            </Typography>
            {courses.length === 0 ? (
                <Alert severity="info" sx={{ 
                  borderRadius: '8px',
                  '& .MuiAlert-icon': {
                    color: colors.primary
                  }
                }}>
                  You are not enrolled in any courses yet.
                </Alert>
              ) : (
                <TableContainer component={Paper} sx={{ 
                  mt: 2,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  border: `1px solid ${colors.border}`
                }}>
                <Table>
                  <TableHead>
                      <TableRow sx={{ 
                        bgcolor: colors.background,
                        '& th': {
                          borderBottom: `2px solid ${colors.border}`,
                          py: 2,
                          fontWeight: 600,
                          color: colors.textDark,
                          fontSize: '0.95rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }
                      }}>
                        <TableCell>Course Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Enrolled At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow 
                        key={`${course.id}-${course.enrollmentId}`}
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              bgcolor: 'rgba(0, 0, 0, 0.02)' 
                            },
                            '&:last-child td': { 
                              borderBottom: 0 
                            },
                            '& td': {
                              py: 2,
                              borderBottom: `1px solid ${colors.border}`,
                              color: colors.textDark,
                              fontSize: '0.95rem'
                            },
                            transition: 'background-color 0.2s ease-in-out'
                          }}
                      >
                        <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                p: 1, 
                                borderRadius: '8px', 
                                bgcolor: 'rgba(37, 99, 235, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <ClassIcon sx={{ color: colors.primary }} />
                              </Box>
                          {course.name}
                            </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.completed ? 'Completed' : 'In Progress'} 
                            color={course.completed ? 'success' : 'primary'}
                              sx={{ 
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                  px: 2
                                }
                              }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(course.enrolledAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: colors.background,
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ffffff, #C7E2FC)',
      position: 'relative'
    }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          color: colors.textDark,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${colors.border}`,
          height: '80px',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Toolbar sx={{ height: '100%' }}>
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
              fontSize: '1.5rem',
              background: colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
              sx={{ 
                color: colors.primary,
                '&:hover': {
                  bgcolor: 'rgba(37, 99, 235, 0.1)'
                }
              }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                color: colors.primary,
                '&:hover': {
                  bgcolor: 'rgba(37, 99, 235, 0.1)'
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
                    bgcolor: 'rgba(37, 99, 235, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: colors.primary }}>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">User Profile</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: colors.error }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">Logout</Typography>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ 
        width: { sm: 280 }, 
        flexShrink: { sm: 0 },
        '& .MuiDrawer-paper': {
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRight: `1px solid ${colors.border}`
        }
      }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
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
              width: 280,
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
          p: 4, 
          width: { sm: `calc(100% - 280px)` },
          background: 'linear-gradient(to bottom, #ffffff, #C7E2FC)',
          minHeight: '100vh',
          position: 'relative',
          pb: { xs: 8, sm: 8 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(52, 152, 219, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(46, 204, 113, 0.1), transparent 40%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Toolbar sx={{ height: '80px' }} />
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'relative'
        }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: colors.textDark, 
            fontWeight: 700,
              fontSize: '2rem',
              background: colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '60px',
                height: '4px',
                background: colors.gradient,
                borderRadius: '2px'
              }
          }}
        >
          Welcome back, {user?.firstName}!
        </Typography>
        </Box>

        {user?.role === 'ADMIN' && renderAdminDashboard()}
        {user?.role === 'INSTRUCTOR' && renderInstructorDashboard()}
        {user?.role === 'STUDENT' && renderStudentDashboard()}
      </Box>

      {/* Navigation Footer - Now visible on all screens */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: 280 }, // Adjust left position based on sidebar
          right: 0,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${colors.border}`,
          py: 1.5,
          px: 2,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: { xs: '100%', sm: '600px' },
            margin: '0 auto'
          }}
        >
          <Button
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: colors.textDark,
              minWidth: 'auto',
              '&:hover': {
                color: colors.primary,
                bgcolor: 'rgba(52, 152, 219, 0.1)',
                borderRadius: '12px'
              },
              transition: 'all 0.2s ease-in-out',
              py: 0.5,
              px: { xs: 1, sm: 2 }
            }}
          >
            <HomeIcon sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
              mb: { xs: 0.25, sm: 0.5 } 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Home
            </Typography>
          </Button>

          <Button
            component={Link}
            to="/courses"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: colors.textDark,
              minWidth: 'auto',
              '&:hover': {
                color: colors.primary,
                bgcolor: 'rgba(52, 152, 219, 0.1)',
                borderRadius: '12px'
              },
              transition: 'all 0.2s ease-in-out',
              py: 0.5,
              px: { xs: 1, sm: 2 }
            }}
          >
            <SchoolIcon sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
              mb: { xs: 0.25, sm: 0.5 } 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Courses
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
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px'
              },
              transition: 'all 0.2s ease-in-out',
              py: 0.5,
              px: { xs: 1, sm: 2 }
            }}
          >
            <LogoutIcon sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
              mb: { xs: 0.25, sm: 0.5 } 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Logout
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;