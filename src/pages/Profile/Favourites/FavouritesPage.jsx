import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../../utils/imageUtils';
import { useNotification } from '../../../context/NotificationContext';
import { Box, Typography, List, ListItem, ListItemText, Alert, Card, ListItemAvatar, Chip, Divider } from '@mui/material';
import Button from '../../../components/Button/Button';
import './FavouritesPage.scss';
import { config } from '../../../environments/config';

const FavouritesPage = ({ user, onNavigate }) => {
  const [likedRelics, setLikedRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    console.log('FavouritesPage: useEffect triggered with user:', user);
    const fetchLikedRelics = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${config.BACKEND_URL}/auth/users/${user._id}/liked-relics`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setLikedRelics(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load liked relics');
        setLoading(false);
      }
    };

    if (user) {
      fetchLikedRelics();
    }
  }, [user]);

  const handleRemoveRelic = async (relicId) => {
    try {
      const accessToken = Cookies.get('accessToken');
      await axios.delete(`${config.BACKEND_URL}/auth/users/${user._id}/liked-relics/${relicId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLikedRelics((prev) => prev.filter((relic) => relic._id !== relicId));
      showNotification('Reliquia eliminada de favoritos', 'success');
    } catch (err) {
      showNotification(
        err.response?.data?.message || 'Error al eliminar reliquia de favoritos',
        'error'
      );
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }} className="favourites-page">
      <Typography variant="h4">Mis Favoritos</Typography>
      <Card>
        <List>
          {likedRelics.length > 0 ? (
            likedRelics.map((relic, index) => (
              <React.Fragment key={relic._id}>
                <ListItem
                  className="relic-item"
                  onClick={() => onNavigate(`/relic/${relic._id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box className="relic-data" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ListItemAvatar>
                      <img
                        src={getImageUrl(relic.picture)}
                        alt={relic.name}
                        className="relic-image"                        
                      />
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText primary={relic.name} />
                      <Chip
                        label={`${relic.niche.category}: ${relic.niche.specific}`}
                        color="secondary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box className="relic-actions">
                      <Button text="Lo quiero" variant="contained" color="primary" size="small" />
                      <Button
                        text="Eliminar"
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleRemoveRelic(relic._id);
                        }}
                      />
                    </Box>
                  </Box>
                </ListItem>
                {index < likedRelics.length - 1 && (
                  <Divider sx={{ bgcolor: '#48182f', my: 1 }} />
                )}
              </React.Fragment>
            ))
          ) : (
            <Typography sx={{ p: 2 }}>No tienes reliquias favoritas aún.</Typography>
          )}
        </List>
      </Card>
    </Box>
  );
};

export default FavouritesPage;