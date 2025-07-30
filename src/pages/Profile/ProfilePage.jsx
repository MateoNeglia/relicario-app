import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
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
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteDialog from '../../components/DeleteDialog/DeleteDialog';
import AddNicheDialog from '../../components/AddNicheDialog/AddNicheDialog';
import EditProfileDialog from '../../components/EditProfileDialog/EditProfileDialog';
import { getProfilePictureUrl } from '../../utils/imageUtils';
import axios from 'axios';
import Cookies from 'js-cookie';
import './ProfilePage.scss';

// ProfileHeader Component
const ProfileHeader = ({ profileUser, isOwnProfile, onMenuAction, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isAdmin = profileUser?.role === 'admin' && isOwnProfile;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (action) => {
    setAnchorEl(null);
    if (action) onMenuAction(action);
  };

  return (
    <Box className="profile-header">
      <Avatar
        className="profile-avatar"
        alt={profileUser.username || 'User'}
        src={getProfilePictureUrl(profileUser.profilePicture) || '/static/images/avatar/1.jpg'}
        sx={{ width: 120, height: 120 }}
      />
      <Box className="profile-info" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="h4" sx={{ marginRight: '.5em' }}>
              {profileUser.username || 'User'}
            </Typography>
            <Chip
              className="exchanges-chip"
              label={`${profileUser.exchanges || 0} intercambios`}
              variant="outlined"
              color="primary"
              sx={{ mr: 2, ml: 2 }}
            />
            <Chip
              label={profileUser.rating || '0.0'}
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
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  bgcolor: '#d4cbc4',
                  color: '#131313',
                  '& .MuiMenuItem-root': {
                    '&:hover': { bgcolor: '#48182f', color: '#d4cbc4' },
                  },
                },
              }}
            >
              {isOwnProfile
                ? [
                    isAdmin && (
                      <MenuItem key="admin" onClick={() => navigate('/admin')}>
                        Panel de Administración
                      </MenuItem>
                    ),
                    <MenuItem key="edit" onClick={() => handleMenuClose('edit')}>
                      Editar Perfil
                    </MenuItem>,
                    <MenuItem key="delete" onClick={() => handleMenuClose('delete-user')}>
                      Eliminar Cuenta
                    </MenuItem>,
                    <MenuItem key="logout" onClick={onLogout}>
                      Cerrar Sesión
                    </MenuItem>,
                  ]
                : [
                    <MenuItem key="report" onClick={() => handleMenuClose('report')}>
                      Reportar Usuario
                    </MenuItem>,
                  ]}
            </Menu>
          </Box>
        </Box>
        
          <Box className="profile-buttons">
            <Button
              variant="contained"
              text={isOwnProfile ? "Mensajes" : "Enviar Mensaje"}
              color="primary"
              onClick={() => navigate('/chat/' + profileUser._id)}
            />
          </Box>
        
      </Box>
    </Box>
  );
};

// NichesSection Component
const NichesSection = ({ niches, isOwnProfile, onDeleteNiche }) => (
  <>
    <Typography variant="h5" gutterBottom>
      {isOwnProfile ? 'Mis Nichos' : 'Nichos'}
    </Typography>
    <Box sx={{ mb: 5 }}>
      {niches && niches.length > 0 ? (
        niches.map((niche, index) => (
          <Chip
            key={`${niche.category}-${niche.specific}`}
            label={`${niche.specific}`}
            onDelete={isOwnProfile ? () => onDeleteNiche(index) : undefined}
            sx={{
              m: 0.5,
              backgroundColor: '#d4cbc4',
              color: '#131313',
              '& .MuiChip-deleteIcon': { color: '#48182f' },
            }}
          />
        ))
      ) : (
        <Typography variant="body1">
          {isOwnProfile ? 'Aún no tienes nichos agregados.' : 'No hay nichos para mostrar.'}
        </Typography>
      )}
    </Box>
  </>
);

// ActionsSection Component
const ActionsSection = ({ isOwnProfile, profileUserId, onAddNiche, onAddRelic, onViewReliquary, onViewFavourites }) => {
  const navigate = useNavigate();

  const handleViewReliquaries = () => {
    navigate(`/reliquary/${profileUserId}`);
  };

  return (
    <>
      <Typography variant="h5">Acciones</Typography>
      <Box className="profile-actions" sx={{ mb: 5 }}>
        {isOwnProfile ? (
          <>
            <Box className="profile-action-row">
              <Button
                variant="outlined"
                text="Mi Relicario"
                color="primary"
                onClick={onViewReliquary}
                fullWidth
              />
              <Button
                variant="outlined"
                text="Mis Favoritos"
                color="primary"
                onClick={onViewFavourites}
                fullWidth
              />
            </Box>
            <Box className="profile-action-row">
              <Button
                variant="outlined"
                text="Agregar Nicho"
                color="primary"
                onClick={onAddNiche}
                fullWidth
              />
              <Button
                variant="outlined"
                text="Agregar Reliquia"
                color="primary"
                onClick={onAddRelic}
                fullWidth
              />
            </Box>
          </>
        ) : (
          <Button
            variant="outlined"
            text="Relicarios"
            color="primary"
            onClick={handleViewReliquaries}
            fullWidth
          />
        )}
      </Box>
    </>
  );
};

// ReviewsSection Component
const ReviewsSection = ({ reviews }) => (
  <>
    <Typography variant="h5" gutterBottom>Reseñas</Typography>
    <Box>
      {reviews && reviews.length > 0 ? (
        reviews.map((review, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{review.reviewerName || 'Anonymous'}</Typography>
              <Rating value={review.rating || 0} readOnly />
              <Typography variant="body2">{review.comment || 'No comment provided'}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1">Aún no hay reseñas.</Typography>
      )}
    </Box>
  </>
);

// Main ProfilePage Component
const ProfilePage = ({userId}) => {
  const navigate = useNavigate();
  const { user, updateUser, updateNiches, logout } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');
  const [nicheError, setNicheError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [nicheIndexToDelete, setNicheIndexToDelete] = useState(null);
  const [openNicheModal, setOpenNicheModal] = useState(false);
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [niches, setNiches] = useState({});

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (userId && userId !== user._id.toString()) {
        try {
          setIsLoading(true);
          const accessToken = Cookies.get('accessToken');
          const response = await axios.get(`/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setProfileUser(response.data);
        } catch (err) {
          setFetchError(err.response?.data?.message || 'Error fetching user profile');
        } finally {
          setIsLoading(false);
        }
      } else {
        setProfileUser(user);
        setIsLoading(false);
      }
    };

    const fetchNiches = async () => {
      try {
        const res = await axios.get('/api/niche/niches');
        setNiches(res.data);
      } catch (err) {
        showNotification('Failed to fetch niches', 'error');
      }
    };

    if (!user) {
      navigate('/login');
    } else {
      fetchProfileUser();
      fetchNiches();
    }
  }, [user, userId, navigate, showNotification]);

  const isOwnProfile = profileUser?._id.toString() === user._id.toString();

  const handleRemoveNiche = async (index) => {
    try {
      const updatedNiches = user.niches.filter((_, i) => i !== index);
      await updateNiches(updatedNiches);
      showNotification('Nicho eliminado exitosamente', 'success');
    } catch (err) {
      showNotification(err.message || 'Error al eliminar nicho', 'error');      
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      await axios.delete(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      showNotification('Cuenta eliminada exitosamente', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error al eliminar cuenta', 'error');
    }
  };

  const handleAddNiche = async (newNiche) => {
    try {
      const updatedNiches = [...(user?.niches || []), newNiche];
      await updateNiches(updatedNiches);
      setOpenNicheModal(false);
      showNotification('Nicho agregado exitosamente', 'success');
    } catch (err) {
      showNotification(err.message || 'Error al agregar nicho', 'error');
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await updateUser(formData);
      setOpenEditProfileModal(false);
      showNotification('Perfil actualizado exitosamente', 'success');
    } catch (err) {
      showNotification(err.message || 'Error al actualizar perfil', 'error');
    }
  };

  const handleDeleteClick = (index) => {
    setNicheIndexToDelete(index);
    setDeleteItemType('niche');
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItemType === 'niche') handleRemoveNiche(nicheIndexToDelete);
    else if (deleteItemType === 'user') handleDeleteUser();
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

  const handleNicheModalClose = () => setOpenNicheModal(false);
  const handleEditProfileModalClose = () => setOpenEditProfileModal(false);

  if (isLoading) return <Typography>Cargando perfil...</Typography>;
  if (fetchError) return <Typography color="error">{fetchError}</Typography>;
  if (!profileUser) return <Typography>Usuario no encontrado</Typography>;

  return (
    <Box className="profile-container" sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {nicheError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setNicheError('')}>
          {nicheError}
        </Alert>
      )}

      <ProfileHeader
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        onMenuAction={(action) => {
          if (action === 'edit') setOpenEditProfileModal(true);
          else if (action === 'delete-user') {
            setDeleteItemType('user');
            setOpenDeleteDialog(true);
          } else if (action === 'report') {
            console.log('Report user functionality to be implemented');
          }
        }}
        onLogout={handleLogout}
      />

      <NichesSection
        niches={profileUser.niches}
        isOwnProfile={isOwnProfile}
        onDeleteNiche={handleDeleteClick}
      />

      <ActionsSection
        isOwnProfile={isOwnProfile}
        profileUserId={profileUser._id}
        onAddNiche={handleNicheModalOpen}
        onAddRelic={() => navigate('/relic/add')}
        onViewReliquary={() => navigate('/reliquary')}
        onViewFavourites={() => navigate('/favourites')}
      />

      <ReviewsSection reviews={profileUser.reviews} />

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
  );
};

export default ProfilePage;