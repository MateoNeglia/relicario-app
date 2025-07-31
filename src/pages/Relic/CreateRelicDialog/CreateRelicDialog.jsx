import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import RelicForm from '../../../components/RelicForm/RelicForm';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNotification } from '../../../context/NotificationContext';

const CreateRelicDialog = ({ open, onClose, onCreate }) => {
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async ({ formData, selectedFile }) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        return;
      }

      const formDataToSend = new FormData();
      const relicData = {
        name: formData.name,
        description: formData.description || undefined,
        niche: {
          category: formData.nicheCategory,
          specific: formData.nicheSpecific,
        },
        year: formData.year || undefined,
        condition: formData.condition,
        set: formData.set || undefined,
      };
      formDataToSend.append('relic', JSON.stringify(relicData));
      if (selectedFile) {
        formDataToSend.append('picture', selectedFile);
      }

      await axios.post('/api/relics/add', formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showNotification('Reliquia agregada al relicario', 'success');
      onCreate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al añadir la reliquia. Intenta de nuevo.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>      
      <DialogContent>
        <RelicForm
          onSubmit={handleSubmit}
          error={error}
          setError={setError}
          submitButtonText="Añadir"
          title="Agrega una nueva Reliquia"
          onClose={onClose}
        />
      </DialogContent>      
    </Dialog>
  );
};

export default CreateRelicDialog;