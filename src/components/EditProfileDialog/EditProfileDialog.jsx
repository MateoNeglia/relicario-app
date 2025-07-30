import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import Button from '../Button/Button';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const EditProfileDialog = ({ open, onClose, user, onUpdateUser, showFields = {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    locationCity: '',
    locationCountry: '',
    username: '',
    email: '',
    role: 'user',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Default field visibility
  const defaultShowFields = {
    name: true,
    lastname: true,
    locationCity: true,
    locationCountry: true,
    username: true,
    email: true,
    profilePicture: true,
    role: false,
  };
  const fieldsToShow = { ...defaultShowFields, ...showFields };

  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        locationCity: user.location?.city || '',
        locationCountry: user.location?.country || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
      });
      setProfilePictureFile(null);
      setImagePreview(null);
      setError('');
    }
  }, [open, user]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setIsCompressing(true);
      try {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const fixedFile = new File([compressedFile], file.name, { type: file.type });
        setProfilePictureFile(fixedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setIsCompressing(false);
        };
        reader.readAsDataURL(fixedFile);
        setError('');
      } catch (err) {
        setError('Error al comprimir la imagen');
        setIsCompressing(false);
      }
    } else {
      setError('Por favor selecciona un archivo de imagen válido (PNG o JPEG)');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [] },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (fieldsToShow.username && !formData.username) {
      setError('Username is required');
      return false;
    }
    if (fieldsToShow.email && !formData.email) {
      setError('Email is required');
      return false;
    }
    if (fieldsToShow.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    const data = new FormData();
    if (fieldsToShow.name) data.append('name', formData.name);
    if (fieldsToShow.lastname) data.append('lastname', formData.lastname);
    if (fieldsToShow.locationCity) data.append('location[city]', formData.locationCity);
    if (fieldsToShow.locationCountry) data.append('location[country]', formData.locationCountry);
    if (fieldsToShow.username) data.append('username', formData.username);
    if (fieldsToShow.email) data.append('email', formData.email);
    if (fieldsToShow.role) data.append('role', formData.role);
    if (fieldsToShow.profilePicture && profilePictureFile) {
      console.log('Appending file:', profilePictureFile);
      data.append('profilePicture', profilePictureFile);
    }

    onUpdateUser(data);
    onClose();
  };
  console.log(user);
  if (!user && open) {
    return null; 
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { color: '#131313', p: 2 },
      }}
    >
      <DialogTitle>Editar {fieldsToShow.role ? 'Usuario' : 'Perfil'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {fieldsToShow.name && (
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
        {fieldsToShow.lastname && (
          <TextField
            fullWidth
            label="Apellido"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
        {fieldsToShow.locationCity && (
          <TextField
            fullWidth
            label="Ciudad"
            name="locationCity"
            value={formData.locationCity}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
        {fieldsToShow.locationCountry && (
          <TextField
            fullWidth
            label="País"
            name="locationCountry"
            value={formData.locationCountry}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}
        {fieldsToShow.profilePicture && (
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #48182f',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? '#f5f5f5' : 'transparent',
              mt: 2,
              mb: 3,
            }}
          >
            <input {...getInputProps()} />
            <Typography variant="body1">
              {isDragActive
                ? 'Suelta la imagen aquí'
                : 'Arrastra y suelta una imagen o haz clic para seleccionar'}
            </Typography>
            {isCompressing && <CircularProgress size={24} sx={{ mt: 1, mb: 1 }} />}
          </Box>
        )}
        {fieldsToShow.profilePicture && (imagePreview || (user && user.profilePicture)) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Vista previa de la imagen:</Typography>
            <img
              src={imagePreview || getProfilePictureUrl(user.profilePicture)}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '16px' }}
            />
          </Box>
        )}
        {fieldsToShow.username && (
          <TextField
            fullWidth
            label="Nombre de Usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            required
          />
        )}
        {fieldsToShow.email && (
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            required
          />
        )}
        {fieldsToShow.role && (
          <TextField
            select
            fullWidth
            label="Rol"
            name="role"
            value={formData.role}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          text="Cancelar"
          variant="outlined"
          color="primary"
        />
        <Button
          onClick={handleConfirm}
          text="Guardar"
          variant="contained"
          color="primary"
          autoFocus
        />
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;