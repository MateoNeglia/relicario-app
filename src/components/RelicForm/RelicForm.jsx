
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import Button from '../Button/Button';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';
import { config } from '../../environments/config';

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
  onClose,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [availableNiches, setAvailableNiches] = useState({});
  const [loadingNiches, setLoadingNiches] = useState(true);
  const [nicheError, setNicheError] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const conditionOptions = [
    'Perfecto Estado',
    'Casi Perfecto Estado',
    'Ligeramente Usado',
    'Moderadamente Usado',
    'Muy Usado',
    'Desgastado',
    'Dañado',
  ];

  // Create a stable reference for initialData to prevent infinite re-renders
  const stableInitialData = useMemo(() => initialData, [
    initialData.name,
    initialData.description,
    initialData.nicheCategory,
    initialData.nicheSpecific,
    initialData.year,
    initialData.condition,
    initialData.set,
    initialData.picture
  ]);

  // Sync formData, selectedFile, and imagePreview with initialData when it changes
  useEffect(() => {
    setFormData(stableInitialData);
    setSelectedFile(null);
    if (stableInitialData.picture) {
      setImagePreview(getImageUrl(stableInitialData.picture));
    } else {
      setImagePreview(null);
    }
  }, [stableInitialData]);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setLoadingNiches(true);
        const res = await axios.get(`${config.BACKEND_URL}/niche/niches`);
        setAvailableNiches(res.data);
        setLoadingNiches(false);
      } catch (err) {
        setNicheError('No se pudieron cargar los nichos');
        setLoadingNiches(false);
      }
    };
    fetchNiches();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setIsCompressing(true);
      try {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const fixedFile = new File([compressedFile], file.name, { type: file.type });
        setSelectedFile(fixedFile);
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
  }, [setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [] },
    maxSize: 5 * 1024 * 1024,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1">
            {isDragActive
              ? 'Suelta la imagen aquí'
              : 'Arrastra y suelta una imagen o haz clic para seleccionar'}
          </Typography>
          {isCompressing && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </Box>
        {(imagePreview || initialData.picture) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Vista previa de la imagen:</Typography>
            <img
              src={imagePreview || getImageUrl(initialData.picture)}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </Box>
        )}
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
            onClick={onClose}
          />
        </Box>
      </form>
    </Box>
  );
};

export default RelicForm;