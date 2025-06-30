import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import Button from '../Button/Button'; 

const AddNicheDialog = ({ open, onClose, niches, onAddNiche }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSpecific, setSelectedSpecific] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customSpecific, setCustomSpecific] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setIsCustom(false);
      setSelectedCategory('');
      setSelectedSpecific('');
      setCustomCategory('');
      setCustomSpecific('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (isCustom) {
      if (!customCategory || !customSpecific) {
        setError('Categoría y especificación personalizadas son obligatorias');
        return;
      }
      onAddNiche({ category: customCategory, specific: customSpecific, isCustom: true });
    } else {
      if (!selectedCategory || !selectedSpecific) {
        setError('Por favor, selecciona una categoría y una especificación');
        return;
      }
      onAddNiche({ category: selectedCategory, specific: selectedSpecific, isCustom: false });
    }
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
      <DialogTitle>Agregar un nicho nuevo</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={isCustom}
              onChange={() => setIsCustom(!isCustom)}
              sx={{ color: '#48182f', '&.Mui-checked': { color: '#48182f' } }}
            />
          }
          label="Nicho Personalizado"
          sx={{ mb: 2 }}
        />
        {isCustom ? (
          <>
            <TextField
              fullWidth
              label="Categoría Personalizada"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Ej: Muebles antiguos"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Especificación Personalizada"
              value={customSpecific}
              onChange={(e) => setCustomSpecific(e.target.value)}
              placeholder="Ej: Mesas de madera"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#131313' }}>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSpecific('');
                }}
                label="Categoría"
                sx={{
                  bgcolor: '#fff',
                  color: '#131313',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#48182f' },
                }}
              >
                <MenuItem value="">Seleccionar Categoría</MenuItem>
                {Object.keys(niches).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
              <InputLabel sx={{ color: '#131313' }}>Especificación</InputLabel>
              <Select
                value={selectedSpecific}
                onChange={(e) => setSelectedSpecific(e.target.value)}
                label="Especificación"
                sx={{
                  bgcolor: '#fff',
                  color: '#131313',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#48182f' },
                }}
              >
                <MenuItem value="">Seleccionar Específico</MenuItem>
                {selectedCategory &&
                  niches[selectedCategory]?.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </>
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
          text="Agregar Nicho"
          variant="contained"
          color="primary"
          autoFocus
        />
      </DialogActions>
    </Dialog>
  );
};

export default AddNicheDialog;