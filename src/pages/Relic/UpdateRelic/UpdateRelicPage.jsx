import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import RelicForm from '../../../components/RelicForm/RelicForm';

const UpdateRelicPage = ({ relicId }) => {
  const { user } = useContext(AuthContext);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRelicData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          setError('No estás autenticado. Por favor, inicia sesión.');
          return;
        }
        const response = await axios.get(`/api/relics/${relicId}`, {
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
    fetchRelicData();
  }, [relicId]);

  const handleSubmit = async ({ formData, selectedFile }) => {
    try {
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

      await axios.patch(`/api/relics/${relicId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      window.location.href = '/profile';
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la reliquia. Intenta de nuevo.');
    }
  };

  if (!initialData) {
    return <div>Cargando...</div>;
  }

  return (
    <RelicForm
      user={user}
      initialData={initialData}
      onSubmit={handleSubmit}
      error={error}
      setError={setError}
      submitButtonText="Actualizar"
      title="Editar Reliquia"
    />
  );
};

export default UpdateRelicPage;