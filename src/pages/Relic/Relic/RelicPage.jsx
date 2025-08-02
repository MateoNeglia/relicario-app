import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';
import { useNotification } from '../../../context/NotificationContext';
import {
  Box,
  Card,
  Typography,
  
  IconButton,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '../../../components/Button/Button';
import './RelicPage.scss';
import { config } from '../../../environments/config';
import LoadingSpinner from '../../../components/LoadingSpinner';
const RelicPage = ({ relicId, user, onNavigate }) => {
  const location = useLocation();
  const { showNotification } = useNotification();
  const [relic, setRelic] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {    

    if (!relicId) {
      setError('Relic ID is missing. Check route configuration.');
      setLoading(false);
      return;
    }

    const fetchRelic = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }
        
        const response = await axios.get(`${config.BACKEND_URL}/relics/${relicId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const relicData = response.data;        
        setRelic(relicData);        
        if (user?._id) {
          setIsOwner(user._id === relicData.owner._id);
setLiked(relicData.likes.includes(user._id));
        }
        setLoading(false);
      } catch (err) {
        console.error('RelicPage: Fetch error=', err);
        setError(err.response?.data?.message || 'Failed to load relic');
        setLoading(false);
      }
    };

    fetchRelic();
  }, [relicId, user]);

  const handleLike = async () => {
    if (!relicId) {
      setError('Relic ID is missing');
      return;
    }
    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.post(
        `${config.BACKEND_URL}/relics/${relicId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setRelic(response.data);
      setLiked(response.data.likes.includes(user._id));
      showNotification('Tu lista de favoritos fue actualizada', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Hubo un error al agregar la reliquia a favoritos', 'error');      
    }
  };

  const handleOwnerClick = () => {
    if (relic?.owner?._id && onNavigate) {
      onNavigate(`/profile/${relic.owner._id}`);
    }
  };

  const handleChatClick = () => {
    if (relic?.owner?._id && relicId && onNavigate) {
      onNavigate(`/chat/${relic.owner._id}?relicId=${relicId}`);
    }
  };

  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate(-1);
    }
  };

  if (loading) {
    return (
      <Box className="relic-page" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="primary">
          <LoadingSpinner size="large" text="Cargando..." color="primary" />
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="relic-page" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!relic) return null;

  return (
    <Box className="relic-page" sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Card className="relic-card" sx={{ p: 3, boxShadow: 3 }}>
        <Box className="relic-content" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          <Box className="relic-image-container" >
            <img
              src={getImageUrl(relic.picture)}
              alt={relic.name}
              className="relic-image"
              style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </Box>
          <Box className="relic-info">
            <Box>
              <h3 className="relic-title" >
                {relic.name}
              </h3>
                    <ul className="relic-details">
                      <li>Condición: {relic.condition || 'Unknown'}</li>
                      <li>Set: {relic.set || 'Unknown'}</li>
                      <li>Año: {relic.year || 'Unknown'}</li>
                      <li>Me Gusta: {relic.likes.length || '0'}</li>
                    </ul>
              
            </Box>
            
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              {isOwner ? (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackClick}
                >
                  VOLVER
                </Button>
              ) : (
                <Box className='relic-actions'>
                  <IconButton
                    color={liked ? 'error' : 'primary'}
                    onClick={handleLike}
                    aria-label="like"
                  >
                    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Box className="message-owner-box">
                    <Button
                      variant="contained"
                      color="secondary"
                      text= {relic.owner?.username || 'Propietario'}
                      onClick={handleOwnerClick}
                    />
                    
                    <Button
                      variant="contained"
                      color="primary"
                      text="Lo Quiero"
                      onClick={handleChatClick}
                    />                     
                  </Box>
                  
                </Box>
              )}
            </Box>
          </Box>
          
        </Box>

        <Typography variant="body1" color="primary" sx={{ mt: 3 }}>
            {relic.description || 'Sin descripción disponible.'}
        </Typography>
      </Card>
    </Box>
  );
};

export default RelicPage;