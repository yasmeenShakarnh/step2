import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Box, Grid, Card, CardContent, 
  IconButton, Divider, Menu, MenuItem, Badge,
  Popover, Chip, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Container, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel,
  Tooltip
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
  Delete as DeleteIcon
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
    primary: '#3498db',
    secondary: '#e67e22',
    background: '#C7E2FC',
    textDark: '#2c3e50',
    textLight: '#7f8c8d',
    white: '#ffffff',
    border: '#e0e0e0'
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
              fontSize: '0.95rem',
              fontWeight: 500 
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
          <Card sx={{ p: 2, bgcolor: '#e8f4fc', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="h6">Total Users</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: colors.primary, mb: 2 }}>
                {stats.totalUsers}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  label={`Students: ${stats.studentCount}`} 
                  variant="outlined" 
                  sx={{ borderColor: colors.primary }}
                />
                <Chip
                  label={`Instructors: ${stats.instructorCount}`}
                  variant="outlined"
                  sx={{ borderColor: colors.secondary }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ClassIcon sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="h6">Total Courses</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: colors.primary }}>
                {stats.courseCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, bgcolor: '#f5f0ff', borderRadius: '12px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ color: colors.primary, mr: 1 }} />
                <Typography variant="h6">Active Enrollments</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: colors.primary }}>
                {stats.enrollmentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: colors.textDark }}>User Management</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{
              bgcolor: 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          mb: 4
        }}
      >
        <Table sx={{ minWidth: 650 }}>
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
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow 
                key={user.id} 
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
                  }
                }}
              >
                <TableCell sx={{ 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountCircleIcon sx={{ color: colors.primary }} />
                  {`${user.firstName} ${user.lastName}`}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={
                      user.role === 'ADMIN' ? 'primary' : 
                      user.role === 'INSTRUCTOR' ? 'secondary' : 'default'
                    }
                    sx={{ 
                      fontWeight: 500,
                      minWidth: '100px',
                      '& .MuiChip-label': {
                        px: 2
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    justifyContent: 'flex-end'
                  }}>
                    <Tooltip title="Edit User" arrow placement="top">
                      <IconButton
                        onClick={() => handleEditClick(user)}
                        disabled={loading}
                        sx={{
                          color: colors.primary,
                          '&:hover': {
                            bgcolor: 'rgba(52, 152, 219, 0.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                          p: 1
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User" arrow placement="top">
                      <IconButton
                        onClick={() => handleDeleteClick(user)}
                        disabled={loading}
                        sx={{
                          color: '#e74c3c',
                          '&:hover': {
                            bgcolor: 'rgba(231, 76, 60, 0.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                          p: 1
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Courses Taught
              </Typography>
              <Typography variant="h4" color="primary">
                {courses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Registered Students
              </Typography>
              <Typography variant="h4" color="primary">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Table */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Students
              </Typography>
         <TableContainer component={Paper} sx={{ mt: 2 }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Course Name</TableCell>
        <TableCell>Instructor</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {courses.map((course) => (
        <TableRow key={course.id}>
          <TableCell>{course.name}</TableCell>
          <TableCell>{`${course.instructorFirstName} ${course.instructorLastName}`}</TableCell>
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Professors
            </Typography>
            <Typography variant="h4" color="primary">
              {new Set(courses.map(course => course.instructorId)).size}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ClassIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              My Courses
            </Typography>
            <Typography variant="h4" color="primary">
              {courses.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Courses List */}
      <Grid item xs={12}>
        <Card sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            {courses.length === 0 ? (
              <Alert severity="info">You are not enrolled in any courses yet.</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Course Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Enrolled At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow 
                        key={`${course.id}-${course.enrollmentId}`}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {course.name}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.completed ? 'Completed' : 'In Progress'} 
                            color={course.completed ? 'success' : 'primary'}
                            sx={{ fontWeight: 'medium' }}
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
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fa' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: colors.white,
          color: colors.textDark,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${colors.border}`,
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
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
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
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemIcon sx={{ color: colors.textDark }}>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">User Profile</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemIcon sx={{ color: colors.textDark }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">Logout</Typography>
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
            fontSize: '2rem'
          }}
        >
          Welcome back, {user?.firstName}!
        </Typography>

        {user?.role === 'ADMIN' && renderAdminDashboard()}
        {user?.role === 'INSTRUCTOR' && renderInstructorDashboard()}
        {user?.role === 'STUDENT' && renderStudentDashboard()}
      </Box>
    </Box>
  );
};

export default Dashboard;