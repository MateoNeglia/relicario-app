import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import Button from '../Button/Button';

const EditProfileDialog = ({ open, onClose, user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    locationCity: '',
    locationCountry: '',
    username: '',
    email: '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        locationCity: user.location?.city || '',
        locationCountry: user.location?.country || '',
        username: user.username || '',
        email: user.email || '',
      });
      setProfilePictureFile(null);
      setError('');
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
    }
  };

  const validateForm = () => {
    if (!formData.username) {
      setError('Username is required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    const data = new FormData();
    data.append('name', formData.name);
    data.append('lastname', formData.lastname);
    data.append('location[city]', formData.locationCity);
    data.append('location[country]', formData.locationCountry);
    data.append('username', formData.username);
    data.append('email', formData.email);
    if (profilePictureFile) {
      data.append('profilePicture', profilePictureFile);
    }

    onUpdateUser(data);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { color: '#131313', p: 2 },
      }}
    >
      <DialogTitle>Editar Perfil</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Apellido"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Ciudad"
          name="locationCity"
          value={formData.locationCity}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="País"
          name="locationCountry"
          value={formData.locationCountry}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: '16px' }}
        />
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