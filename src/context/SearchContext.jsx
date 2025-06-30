import { createContext, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState({ query: '', filters: { page: 1 }, sort: {} });
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchError, setSearchError] = useState('');

  const updateSearchParams = async ({ query, filters, sort }) => {    
    try {
      const page = filters.page || 1;
      const accessToken = Cookies.get('accessToken');
      
      const response = await axios.get('/api/relics', {
        params: {
          name: query || undefined,
          page: page,
          limit: 6,
          category: filters.category || undefined,
          specific: filters.specific || undefined,
          condition: filters.condition || undefined,
          sortBy: sort.sortBy || undefined,
          order: sort.order || undefined,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });
      
      setSearchParams({ query, filters: { ...filters, page }, sort });
      setSearchResults(response.data.relics || []);
      setPagination(response.data.pagination || {});
      setSearchError('');
    } catch (err) {
      console.error('SearchContext: Search error=', err.response?.data || err.message);
      setSearchResults([]);
      setPagination({});
      setSearchParams({ query: '', filters: { page: 1 }, sort: {} });
      setSearchError(err.response?.data?.message || 'Failed to fetch search results');
    }
  };

  return (
    <SearchContext.Provider value={{ searchParams, searchResults, pagination, searchError, updateSearchParams }}>
      {children}
    </SearchContext.Provider>
  );
};