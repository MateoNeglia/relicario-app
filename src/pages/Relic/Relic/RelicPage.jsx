import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './RelicPage.scss';

const RelicPage = ({ relicId, user, onNavigate }) => {
  const location = useLocation();
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
        
        const response = await axios.get(`/api/relics/${relicId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const relicData = response.data;        
        setRelic(relicData);
        console.log("user", user);
        console.log("relicData", relicData);
        if (user?.id) {
          setIsOwner(user.id === relicData.owner._id);
          setLiked(relicData.likes.includes(user.id));
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
        `/api/relics/${relicId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setRelic(response.data);
      setLiked(response.data.likes.includes(user.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle like');
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
          Loading...
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
              <Typography variant="body1" color="textSecondary" paragraph>
                {relic.description || 'No description available'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              {isOwner ? (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackClick}
                >
                  Back
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
                      onClick={handleOwnerClick}
                    >
                      {relic.owner.username}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleChatClick}
                    >
                      Lo Quiero
                    </Button>
                  </Box>
                  
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default RelicPage;