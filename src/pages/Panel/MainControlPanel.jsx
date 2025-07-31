import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import EditProfileDialog from '../../components/EditProfileDialog/EditProfileDialog';
import DeleteDialog from '../../components/DeleteDialog/DeleteDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './MainControlPanel.scss';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const MainControlPanel = () => {
  const { user, register } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 7;

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
    console.log('user', user);
  }, [user, navigate]);

  // Fetch paginated users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please log in again.');
        }
        const response = await axios.get(`/api/auth/admin/users?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });        
        if (!Array.isArray(response.data.users)) {
          throw new Error('Expected an array of users, received: ' + JSON.stringify(response.data.users));
        }
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
        setError(errorMessage);
        setUsers([]);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [showNotification, user, page]);

  // Handle form input changes for create dialog
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password, formData.role, true);
      setOpenCreateDialog(false);
      setFormData({ username: '', email: '', password: '', passwordConfirm: '', role: 'user' });
      showNotification('User created successfully', 'success');
      // Refresh user list for the current page
      const response = await axios.get(`/api/auth/admin/users?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
      });
      if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Hubo un error al crear el usuario', 'error');
    }
  };

  // Edit user
  const handleEditUser = async (formData) => {
    try {
      // Log FormData contents for debugging
      const formDataEntries = {};
      for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log('FormData being sent:', formDataEntries);

      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      if (!selectedUser?._id) {
        throw new Error('No user selected for editing');
      }

      const response = await axios.patch(`/api/auth/admin/users/${selectedUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refetch users to ensure the UI is up-to-date
      const usersResponse = await axios.get(`/api/auth/admin/users?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (Array.isArray(usersResponse.data.users)) {
        setUsers(usersResponse.data.users);
        setTotalPages(usersResponse.data.totalPages);
        setTotalUsers(usersResponse.data.totalUsers);
      }

      setOpenEditDialog(false);
      setSelectedUser(null);
      showNotification('User updated successfully', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user';
      console.error('Edit user error:', err);
      showNotification(errorMessage, 'error');
    }
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (user) => {
    if (!user) {
      console.error('Attempted to open delete dialog with null user');
      return;
    }
    setSelectedUser(user);
    setDeleteItemType('user');
    setOpenDeleteDialog(true);
  };

  // Handle delete dialog cancel
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setDeleteItemType(null);
    setSelectedUser(null);
  };

  // Handle delete dialog confirm
  const handleDeleteConfirm = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      if (!selectedUser?._id) {
        throw new Error('No user selected for deletion');
      }
      await axios.delete(`/api/auth/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Refresh user list for the current page
      const response = await axios.get(`/api/auth/admin/users?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
        // If the current page is empty and not the first page, go to the previous page
        if (response.data.users.length === 0 && page > 1) {
          setPage(page - 1);
        }
      }
      setOpenDeleteDialog(false);
      setDeleteItemType(null);
      setSelectedUser(null);
      showNotification('Cuenta eliminada exitosamente', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar cuenta';
      console.error('Delete user error:', err);
      showNotification(errorMessage, 'error');
    }
  };

  // Open edit dialog with user data
  const handleOpenEditDialog = (user) => {
    if (!user) {
      console.error('Attempted to open edit dialog with null user');
      return;
    }
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Box className="main-control-panel" sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Control Panel
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateDialog(true)}
        sx={{ mb: 2, mr: 2 }}
      >
        Crear nuevo usuario
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/admin/relic-control')}
        sx={{ mb: 2 }}
      >
        Ir al panel de control de reliquias
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Profile Picture</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Avatar
                      className="profile-avatar"
                      alt={user.username || 'User'}
                      src={getProfilePictureUrl(user.profilePicture) || '/static/images/avatar/1.jpg'}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(user)}>
                      <DeleteIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
        Mostrando {users.length} de {totalUsers} usuarios
      </Typography>

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Confirm Password"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditProfileDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdateUser={handleEditUser}
          showFields={{
            name: true,
            lastname: true,
            locationCity: true,
            locationCountry: true,
            username: true,
            email: true,
            profilePicture: true,
            role: true,
          }}
        />
      )}

      {/* Delete User Dialog */}
      <DeleteDialog
        isOpen={openDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType={deleteItemType}
        itemName={selectedUser?.username}
      />
    </Box>
  );
};

export default MainControlPanel;