import { useState, useEffect } from 'react';
import {  
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import Button from '../Button/Button';
import axios from 'axios';

const RelicForm = ({
  user,
  initialData = {
    name: '',
    description: '',
    nicheCategory: '',
    nicheSpecific: '',
    year: '',
    condition: '',
    set: '',
    picture: '',
  },
  onSubmit,
  error,
  setError,
  submitButtonText = 'Añadir',
  title = 'Agrega una nueva Reliquia',
}) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [availableNiches, setAvailableNiches] = useState({});
  const [loadingNiches, setLoadingNiches] = useState(true);
  const [nicheError, setNicheError] = useState('');

  const conditionOptions = [
    'Perfecto Estado',
    'Casi Perfecto Estado',
    'Ligeramente Usado',
    'Moderadamente Usado',
    'Muy Usado',
    'Desgastado',
    'Dañado',
  ];

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setLoadingNiches(true);
        const res = await axios.get('/api/niche/niches');
        setAvailableNiches(res.data);
        setLoadingNiches(false);
      } catch (err) {
        setNicheError('No se pudieron cargar los nichos');
        setLoadingNiches(false);
      }
    };
    fetchNiches();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setSelectedFile(null);
      setImagePreview(null);
      setError('Por favor selecciona un archivo de imagen válido (PNG o JPEG)');
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.nicheCategory || !formData.nicheSpecific || !formData.condition) {
      setError('Nombre, nicho y condición son obligatorios');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ formData, selectedFile });
  };

  return (
    <Box className="add-relic-container" sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {nicheError && <Alert severity="error" sx={{ mb: 2 }}>{nicheError}</Alert>}
      {loadingNiches && <Typography sx={{ mb: 2 }}>Cargando nichos...</Typography>}
      <form onSubmit={handleFormSubmit}>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
          />
        </FormControl>
        {!loadingNiches && !nicheError && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Categoría del Nicho *</InputLabel>
              <Select
                name="nicheCategory"
                value={formData.nicheCategory}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nicheCategory: e.target.value,
                    nicheSpecific: '',
                  });
                }}
                required
                label="Categoría del Nicho *"
              >
                <MenuItem value="">Selecciona Categoría</MenuItem>
                {Object.keys(availableNiches).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.nicheCategory && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Nicho Específico *</InputLabel>
                <Select
                  name="nicheSpecific"
                  value={formData.nicheSpecific}
                  onChange={handleChange}
                  required
                  label="Nicho Específico *"
                >
                  <MenuItem value="">Selecciona Específico</MenuItem>
                  {availableNiches[formData.nicheCategory]?.map((specific) => (
                    <MenuItem key={specific} value={specific}>
                      {specific}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}
        <FormControl fullWidth margin="normal">
          <TextField
            label="Año"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 1995"
            variant="outlined"
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Condición *</InputLabel>
          <Select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            label="Condición *"
          >
            <MenuItem value="">Selecciona Condición</MenuItem>
            {conditionOptions.map((condition) => (
              <MenuItem key={condition} value={condition}>
                {condition}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Set"
            name="set"
            value={formData.set}
            onChange={handleChange}
            placeholder="e.g., First Edition"
            variant="outlined"
          />
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            text="Subir Imagen"
            component="label"
          >
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
            />
          </Button>
          {(imagePreview || initialData.picture) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Vista previa de la imagen:</Typography>
              <img
                src={imagePreview || initialData.picture}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </Box>
          )}
        </Box>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            text={submitButtonText}
          />
          <Button
            variant="outlined"
            color="primary"
            text="Cancelar"
            onClick={() => (window.location.href = '/profile')}
          />
        </Box>
      </form>
    </Box>
  );
};

export default RelicForm;