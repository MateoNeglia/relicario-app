import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  TextField,
  IconButton,
  Alert,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import useDebounce from '../../hooks/useDebounce.js';
import './SearchBar.scss';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    specific: '',
    condition: '',
  });
  const [niches, setNiches] = useState({});
  const [nicheError, setNicheError] = useState('');
  const [conditions] = useState([
    'Perfecto Estado',
    'Casi Perfecto Estado',
    'Ligeramente Usado',
    'Moderadamente Usado',
    'Muy Usado',
    'Desgastado',
    'Dañado',
  ]);
  const [openModal, setOpenModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [sort, setSort] = useState({ sortBy: 'createdAt', order: 'desc' });
  const [openSortModal, setOpenSortModal] = useState(false);
  const [tempSort, setTempSort] = useState({ sortBy: 'createdAt', order: 'desc' });
  const [searchCompleted, setSearchCompleted] = useState(false);
  const searchBarRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  const sortOptions = [
    { value: 'createdAt', label: 'Recently Created' },
    { value: 'updatedAt', label: 'Recently Updated' },
    { value: 'likes', label: 'Most Likes' },
    { value: 'ownerName', label: "Owner's Name" },
    { value: 'year', label: 'Year' },
    { value: 'set', label: 'Set' },
    { value: 'condition', label: 'Condition' },
    { value: 'name', label: 'Name' },
  ];

  const orderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const response = await axios.get('/api/niche/niches');
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          setNiches(response.data);
        } else {
          setNicheError('Invalid niches data received');
        }
      } catch (err) {
        setNicheError('Failed to load filter options');
      }
    };
    fetchNiches();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const accessToken = Cookies.get('accessToken');
      if (!debouncedQuery.trim() || searchCompleted) {
        setSuggestions([]);
        setSuggestionsError('');
        return;
      }
      setSuggestionsLoading(true);
      try {
        const response = await axios.get('/api/relics/suggestions', {
          params: { query: debouncedQuery },
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
          },
        });
        setSuggestions(response.data || []);
        setSuggestionsError('');
      } catch (err) {
        console.error('SearchBar: fetchSuggestions error=', err.response?.data || err.message);
        setSuggestions([]);
        setSuggestionsError('Failed to load suggestions');
      } finally {
        setSuggestionsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, searchCompleted]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSearchCompleted(false); 
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setSearchCompleted(true); 
    onSearch({ query: suggestion, filters, sort });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { specific: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() || filters.category || filters.specific || filters.condition || sort.sortBy) {
      setSuggestions([]);
      setSearchCompleted(true); 
      onSearch({ query, filters, sort });
    }
  };

  const handleOpenModal = () => {
    setTempFilters(filters);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setOpenModal(false);
    setSearchCompleted(true); 
    onSearch({ query, filters: tempFilters, sort });
  };

  const handleSortByChange = (e) => {
    setTempSort((prev) => ({ ...prev, sortBy: e.target.value }));
  };

  const handleOrderChange = (e) => {
    setTempSort((prev) => ({ ...prev, order: e.target.value }));
  };

  const handleOpenSortModal = () => {
    setTempSort(sort);
    setOpenSortModal(true);
  };

  const handleCloseSortModal = () => {
    setOpenSortModal(false);
  };

  const handleApplySort = () => {
    setSort(tempSort);
    setOpenSortModal(false);
    setSearchCompleted(true); 
    onSearch({ query, filters, sort: tempSort });
  };

  return (
    <Box
      component="form"
      className="search-bar"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}
      ref={searchBarRef}
    >
      <TextField
        value={query}
        onChange={handleInputChange}
        placeholder="Busca Coleccionables..."
        variant="outlined"
        size="small"
        className="search-input"
        sx={{ flex: 1 }}
        inputProps={{ 'aria-label': 'Search collectibles' }}
      />
      {suggestionsLoading && (
        <CircularProgress size={20} sx={{ position: 'absolute', right: 80, top: 10 }} />
      )}
      {suggestionsError && (
        <Alert severity="error" className="suggestions-error" sx={{ my: 1 }}>
          {suggestionsError}
        </Alert>
      )}
      {suggestions.length > 0 && (
        <List
          className="suggestions-list"
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            boxShadow: 3,
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 10,
            borderRadius: 1,
            mt: 0.5,
          }}
        >
          {suggestions.map((suggestion) => (
            <ListItem
              key={suggestion}              
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{ py: 0.5 }}
            >
              <ListItemText primary={suggestion} />
            </ListItem>
          ))}
        </List>
      )}
      {nicheError && (
        <Alert severity="error" className="niche-error" sx={{ my: 1 }}>
          {nicheError}
        </Alert>
      )}
      <IconButton type="submit" className="search-button" aria-label="search">
        <SearchIcon />
      </IconButton>
      <Button variant="outlined" className="filter-button" onClick={handleOpenModal} 
        sx={{ ml: 1, '& .MuiSvgIcon-root': { fontSize: '20px', marginRight: '5px' } }}>
        <FilterAltIcon />
        Filtros
      </Button>
      <Button variant="outlined" className="filter-button" onClick={handleOpenSortModal} 
      sx={{ ml: 1, '& .MuiSvgIcon-root': { fontSize: '20px', marginRight: '5px' } }}>
        <FilterListIcon />
        Ordenar
      </Button>

      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="filter-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 300,
            maxWidth: 500,
          }}
        >
          <Typography id="filter-modal-title" variant="h6" gutterBottom>
            Aplicar Filtros
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select
              name="category"
              value={tempFilters.category}
              onChange={handleFilterChange}
              label="Categoría"
            >
              <MenuItem value="">Seleccionar Categoría</MenuItem>
              {Object.keys(niches).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={!tempFilters.category}>
            <InputLabel>Específico</InputLabel>
            <Select
              name="specific"
              value={tempFilters.specific}
              onChange={handleFilterChange}
              label="Específico"
            >
              <MenuItem value="">All Specifics</MenuItem>
              {tempFilters.category &&
                niches[tempFilters.category]?.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Condición</InputLabel>
            <Select
              name="condition"
              value={tempFilters.condition}
              onChange={handleFilterChange}
              label="Condición"
            >
              <MenuItem value="">All Conditions</MenuItem>
              {conditions.map((cond) => (
                <MenuItem key={cond} value={cond}>
                  {cond}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleApplyFilters}>
              Aplicar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openSortModal} onClose={handleCloseSortModal} aria-labelledby="sort-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 300,
            maxWidth: 500,
          }}
        >
          <Typography id="sort-modal-title" variant="h6" gutterBottom>
            Ordenar Resultados
          </Typography>
          <FormControl component="fieldset">
            <FormLabel component="legend">Ordenar por</FormLabel>
            <RadioGroup name="sortBy" value={tempSort.sortBy} onChange={handleSortByChange}>
              {sortOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Orden</FormLabel>
            <RadioGroup name="order" value={tempSort.order} onChange={handleOrderChange}>
              {orderOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCloseSortModal}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleApplySort}>
              Aplicar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchBar;