import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import RelicForm from '../../../components/RelicForm/RelicForm';


const AddRelicPage = () => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');

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

      window.location.href = '/profile';
    } catch (err) {
      setError(err.response?.data?.message || 'Error al añadir la reliquia. Intenta de nuevo.');
    }
  };

  return (
    <RelicForm
      user={user}
      onSubmit={handleSubmit}
      error={error}
      setError={setError}
      submitButtonText="Añadir"
      title="Agrega una nueva Reliquia"
    />
  );
};

export default AddRelicPage;