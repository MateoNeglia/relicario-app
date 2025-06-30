import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchContext } from '../../context/SearchContext';
import { getImageUrl } from '../../utils/imageUtils'; 
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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './SearchResultsPage.scss';

const SearchResults = () => {
  const { searchParams, searchResults, pagination, searchError, updateSearchParams } = useContext(SearchContext) || {};
  const navigate = useNavigate();

  if (!searchParams) {
    console.error('SearchResults: SearchContext is undefined');
    return <Typography variant="body1">Error: Search context not available</Typography>;
  }

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

  return (
    <Box className="search-results">
      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}
      {searchResults.length > 0 ? (
        <>
          <Typography variant="h3" color='primary' className='search-results-title'>
            Resultados de la Búsqueda
          </Typography>
          <Card>
            <List>
              {searchResults.map((relic, index) => (
                <React.Fragment key={relic._id}>
                  <ListItem
                    className="search-result-item"
                    sx={{ display: 'flex', alignItems: 'flex-start', p: 2 }}
                    onClick={() => handleRelicClick(relic._id)}
                  >
                    <Box className="relic-item">
                      {/* Left Side: Image */}
                      <Box className="relic-data">
                        <ListItemAvatar>
                          <img
                            src={getImageUrl(relic.picture)}
                            alt={relic.name}
                            className="relic-image"
                          />
                        </ListItemAvatar>                      
                        {/* Left Side: Text and Chip */}
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
                      {/* Right Side: Heart and Buttons */}
                      <Box className="relic-actions">
                        <IconButton aria-label="like" sx={{ alignSelf: 'flex-end' }}>
                          <FavoriteBorderIcon color="primary"/>
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
              ))}
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
        <Typography variant="body1">No results found.</Typography>
      )}
    </Box>
  );
};

export default SearchResults;