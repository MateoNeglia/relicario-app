import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import RelicForm from '../../../components/RelicForm/RelicForm';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNotification } from '../../../context/NotificationContext';
import { config } from '../../../environments/config';
import LoadingSpinner from '../../../components/LoadingSpinner';
const UpdateRelicDialog = ({ open, onClose, relicId, onUpdate }) => {
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    console.log('relicId', relicId);
    const fetchRelicData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          setError('No estás autenticado. Por favor, inicia sesión.');
          return;
        }
        const response = await axios.get(`${config.BACKEND_URL}/relics/${relicId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const relic = response.data;
        setInitialData({
          name: relic.name || '',
          description: relic.description || '',
          nicheCategory: relic.niche?.category || '',
          nicheSpecific: relic.niche?.specific || '',
          year: relic.year?.toString() || '',
          condition: relic.condition || '',
          set: relic.set || '',
          picture: relic.picture || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los datos de la reliquia');
      }
    };
    if (open && relicId) {
      fetchRelicData();
    }
  }, [open, relicId]);

  // Reset initialData when dialog closes
  useEffect(() => {
    if (!open) {
      setInitialData(null);
      setError('');
    }
  }, [open]);

  const handleSubmit = async ({ formData, selectedFile }) => {
    try {
      setIsSubmitting(true);
      setError('');
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        return;
      }

      const formDataToSend = new FormData();
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.nicheCategory && formData.nicheSpecific) {
        formDataToSend.append('niche[category]', formData.nicheCategory);
        formDataToSend.append('niche[specific]', formData.nicheSpecific);
      }
      if (formData.year) formDataToSend.append('year', formData.year);
      if (formData.condition) formDataToSend.append('condition', formData.condition);
      if (formData.set) formDataToSend.append('set', formData.set);
      
      if (!selectedFile && formData.picture) {
        formDataToSend.append('picture', formData.picture);
      }
      if (selectedFile) {
        formDataToSend.append('picture', selectedFile);
      }

      await axios.patch(`${config.BACKEND_URL}/relics/${relicId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      showNotification('Reliquia actualizada', 'success');
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la reliquia. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>      
      <DialogContent>
        {initialData ? (
          <RelicForm
            key={relicId} // Optional: Forces remounting for each relic
            initialData={initialData}
            onSubmit={handleSubmit}
            error={error}
            setError={setError}
            submitButtonText="Actualizar"
            title="Editar Reliquia"
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        ) : (
          <LoadingSpinner size="large" text="Cargando..." color="primary" />
        )}
      </DialogContent>      
    </Dialog>
  );
};

export default UpdateRelicDialog;