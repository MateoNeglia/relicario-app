import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Rating,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import Button from '../../components/Button/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteDialog from '../../components/DeleteDialog/DeleteDialog';
import AddNicheDialog from '../../components/AddNicheDialog/AddNicheDialog';
import EditProfileDialog from '../../components/EditProfileDialog/EditProfileDialog';
import axios from 'axios';
import Cookies from 'js-cookie';
import './ProfilePage.scss';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, updateNiches, logout } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [nicheIndexToDelete, setNicheIndexToDelete] = useState(null);
  const [openNicheModal, setOpenNicheModal] = useState(false);
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [niches, setNiches] = useState({});
  const [nicheError, setNicheError] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchReviews();
      fetchNiches();
    }
  }, [user, navigate]);

  const fetchReviews = async () => {
    try {
      const userReviews = user.reviews || [];
      setReviews(userReviews);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const fetchNiches = async () => {
    try {
      const res = await axios.get('/api/niche/niches');
      setNiches(res.data);
    } catch (err) {
      setNicheError('Failed to fetch niches');
    }
  };

  const handleRemoveNiche = async (index) => {
    try {
      const updatedNiches = user.niches.filter((_, i) => i !== index);
      await updateNiches(updatedNiches);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('No access token found');
        return;
      }
      await axios.delete(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleAddNiche = async (newNiche) => {
    try {
      const updatedNiches = [...(user?.niches || []), newNiche];
      await updateNiches(updatedNiches);
      setOpenNicheModal(false);
    } catch (err) {
      setNicheError(err.message);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await updateUser(formData); 
      setOpenEditProfileModal(false);
    } catch (err) {
      console.error('error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (action) => {
    if (action === 'edit') {
      setError('');
      setOpenEditProfileModal(true);
    } else if (action === 'delete-user') {
      setDeleteItemType('user');
      setOpenDeleteDialog(true);
    }
    setAnchorEl(null);
  };

  const handleDeleteClick = (index) => {
    setNicheIndexToDelete(index);
    setDeleteItemType('niche');
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItemType === 'niche') {
      handleRemoveNiche(nicheIndexToDelete);
    } else if (deleteItemType === 'user') {
      handleDeleteUser();
    }
    setOpenDeleteDialog(false);
    setNicheIndexToDelete(null);
    setDeleteItemType(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setNicheIndexToDelete(null);
    setDeleteItemType(null);
  };

  const handleNicheModalOpen = () => {
    setNicheError('');
    setOpenNicheModal(true);
  };

  const handleNicheModalClose = () => {
    setOpenNicheModal(false);
  };

  const handleEditProfileModalClose = () => {
    setOpenEditProfileModal(false);
  };

  return user ? (
    <Box className="profile-container" sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {nicheError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setNicheError('')}>
          {nicheError}
        </Alert>
      )}

      <Box className="profile-header">
        <Avatar
          className="profile-avatar"
          alt={user.username || 'User'}
          src={user.profilePicture || '/static/images/avatar/1.jpg'}
          sx={{ width: 120, height: 120 }}
        />
        <Box className="profile-info" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Typography variant="h4" sx={{ marginRight: '.5em' }}>
                {user.username || 'User'}
              </Typography>
              <Chip
                className="exchanges-chip"
                label={`${user.exchanges || 0} intercambios`}
                variant="outlined"
                color="primary"
                sx={{ mr: 2, ml: 2 }}
              />
              <Chip
                label={user.rating || '0.0'}
                icon={<StarIcon />}
                color="primary"
                sx={{ mr: 2, color: '#d4cbc4', backgroundColor: '#131313' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: '#48182f' }}
                aria-label="settings"
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleMenuClose()}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    bgcolor: '#d4cbc4',
                    color: '#131313',
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        bgcolor: '#48182f',
                        color: '#d4cbc4',
                      },
                    },
                  },
                }}
              >
                {isAdmin && (
                  <MenuItem onClick={() => navigate('/admin')}>
                    Panel de Administración
                  </MenuItem>
                )}
                <MenuItem onClick={() => handleMenuClose('edit')}>
                  Editar Perfil
                </MenuItem>
                <MenuItem onClick={() => handleMenuClose('delete-user')}>
                  Eliminar Cuenta
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </Box>
          </Box>
          <Box className="profile-buttons">
            <Button
              variant="contained"
              text="Mensajes"
              color="primary"
              onClick={() => navigate('/messages')}
            />
          </Box>
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom>
        Mis Nichos
      </Typography>
      <Box sx={{ mb: 5 }}>
        {user.niches && user.niches.length > 0 ? (
          user.niches.map((niche, index) => (
            <Chip
              key={`${niche.category}-${niche.specific}`}
              label={`${niche.specific}`}
              onDelete={() => handleDeleteClick(index)}
              sx={{
                m: 0.5,
                backgroundColor: '#d4cbc4',
                color: '#131313',
                '& .MuiChip-deleteIcon': {
                  color: '#48182f',
                },
              }}
            />
          ))
        ) : (
          <Typography variant="body1">Aún no tienes nichos agregados.</Typography>
        )}
      </Box>

      <Typography variant="h5">
        Acciones
      </Typography>
      <Box className="profile-actions" sx={{ mb: 5 }}>
        <Box className="profile-action-row">
          <Button
            variant="outlined"
            text="Mi Relicario"
            color="primary"
            onClick={() => navigate('/reliquary')}
            fullWidth
          />
          <Button
            variant="outlined"
            text="Mis Favoritos"
            color="primary"
            onClick={() => navigate('/favourites')}
            fullWidth
          />
        </Box>
        <Box className="profile-action-row">
          <Button
            variant="outlined"
            text="Agregar Nicho"
            color="primary"
            onClick={handleNicheModalOpen}
            fullWidth
          />
          <Button
            variant="outlined"
            text="Agregar Reliquia"
            color="primary"
            onClick={() => navigate('/relic/add')}
            fullWidth
          />
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom>
        Reseñas
      </Typography>
      <Box>
        {reviews.length > 0 ? (
          user.reviews.map((review, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  {review.reviewerName || 'Anonymous'}
                </Typography>
                <Rating value={review.rating || 0} readOnly />
                <Typography variant="body2">
                  {review.comment || 'No comment provided'}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1">Aún no hay reseñas.</Typography>
        )}
      </Box>

      <DeleteDialog
        isOpen={openDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType={deleteItemType}
      />

      <AddNicheDialog
        open={openNicheModal}
        onClose={handleNicheModalClose}
        niches={niches}
        onAddNiche={handleAddNiche}
      />

      <EditProfileDialog
        open={openEditProfileModal}
        onClose={handleEditProfileModalClose}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
    </Box>
  ) : null;
};

export default Profile;