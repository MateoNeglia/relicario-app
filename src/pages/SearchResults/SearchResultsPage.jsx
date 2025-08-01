import React, { useContext, useState, useEffect } from 'react';
import { config } from '../../environments/config';
import { useNavigate } from 'react-router-dom';
import { SearchContext } from '../../context/SearchContext';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/imageUtils';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Pagination,
  Alert,
  Typography,
  Card,
  Divider,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './SearchResultsPage.scss';

const SearchResults = () => {
  const { searchParams, searchResults, pagination, searchError, updateSearchParams } = useContext(SearchContext) || {};
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [likedRelics, setLikedRelics] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  // Fetch the user's liked relics whenever searchResults change
  useEffect(() => {
    const fetchUserLikedRelics = async () => {
      if (isFetching) return; // Prevent multiple concurrent fetches
      setIsFetching(true);
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken || !user?._id) {
console.log('No access token or user ID found', { accessToken, userId: user?._id });
          setLikedRelics({});
          return;
        }
        const response = await axios.get(`${config.BACKEND_URL}/auth/users/${user._id}/liked-relics`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const likedRelicIds = response.data.map(relic => relic._id);
        console.log('Fetched liked relics:', likedRelicIds);

        // Initialize liked state for current search results
        const initialLikedState = {};
        searchResults.forEach(relic => {
          initialLikedState[relic._id] = likedRelicIds.includes(relic._id);
        });
        setLikedRelics(initialLikedState);
        console.log('Initialized liked relics state:', initialLikedState);
      } catch (err) {
        console.error('Error fetching user liked relics:', err);
        showNotification('Error al cargar los favoritos', 'error');
      } finally {
        setIsFetching(false);
      }
    };
    fetchUserLikedRelics();
  }, [searchResults, user, showNotification]);

  const handlePageChange = (event, value) => {
    updateSearchParams({
      query: searchParams.query,
      filters: { ...searchParams.filters, page: value },
      sort: searchParams.sort,
    });
  };

  const handleRelicClick = (relicId) => {
    navigate(`/relic/${relicId}`);
  };

  const handleOwnerClick = (ownerId) => {
    navigate(`/profile/${ownerId}`);
  };

  const handleChatClick = (ownerId) => {
    navigate(`/chat/${ownerId}`);
  };

  const handleLike = async (relicId) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken || !user?._id) {
        showNotification('Por favor, inicia sesión para dar like', 'error');
        return;
      }
      const response = await axios.post(
        `${config.BACKEND_URL}/relics/${relicId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const isNowLiked = response.data.likes.includes(user._id);
      setLikedRelics((prev) => ({
        ...prev,
        [relicId]: isNowLiked,
      }));
      console.log(`Relic ${relicId} like status updated to:`, isNowLiked);
      showNotification('Tu lista de favoritos fue actualizada', 'success');
    } catch (err) {
      console.error('Error liking/unliking relic:', err);
      showNotification(err.response?.data?.message || 'Hubo un error al agregar la reliquia a favoritos', 'error');
    }
  };

  if (!searchParams) {
    console.error('SearchResults: SearchContext is undefined');
    return <Typography variant="body1">Error: Search context not available</Typography>;
  }

  return (
    <Box className="search-results">
      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}
      {searchResults.length > 0 ? (
        <>
          <Typography variant="h3" color="primary" className="search-results-title">
            Resultados de la Búsqueda
          </Typography>
          <Card>
            <List>
              {searchResults.map((relic, index) => {
                const isLiked = likedRelics[relic._id] ?? false;
                console.log(`Relic ${relic._id} isLiked:`, isLiked);
                return (
                  <React.Fragment key={relic._id}>
                    <ListItem
                      className="search-result-item"
                      sx={{ display: 'flex', alignItems: 'flex-start', p: 2 }}
                      onClick={() => handleRelicClick(relic._id)}
                    >
                      <Box className="relic-item">
                        <Box className="relic-data">
                          <ListItemAvatar>
                            <img
                              src={getImageUrl(relic.picture)}
                              alt={relic.name}
                              className="relic-image"
                            />
                          </ListItemAvatar>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleRelicClick(relic._id)}
                            >
                              {relic.name}
                            </Typography>
                            <Typography variant="body2" component="div" color="primary">
                              Condición: <b>{relic.condition}</b>
                            </Typography>
                            <Chip
                              label={`${relic.niche.category}: ${relic.niche.specific}`}
                              color="secondary"
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Box>
                        <Box className="relic-actions">
                          <IconButton
                            aria-label="like"
                            sx={{ alignSelf: 'flex-end' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(relic._id);
                            }}
                          >
                            {isLiked ? (
                              <FavoriteIcon color="error" />
                            ) : (
                              <FavoriteBorderIcon color="primary" />
                            )}
                          </IconButton>
                          <Box className="link-actions" sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOwnerClick(relic.owner._id);
                              }}
                            >
                              {relic.owner.username}
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChatClick(relic.owner._id);
                              }}
                            >
                              Lo quiero
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < searchResults.length - 1 && (
                      <Divider sx={{ bgcolor: '#48182f', my: 1 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
          {pagination.totalPages > 1 && (
            <Box className="pagination" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1">No se encontraron resultados.</Typography>
      )}
    </Box>
  );
};

export default SearchResults;