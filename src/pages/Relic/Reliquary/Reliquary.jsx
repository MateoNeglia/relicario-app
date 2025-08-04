import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Button from '../../../components/Button/Button';
import { config } from '../../../environments/config';
import LoadingSpinner from '../../../components/LoadingSpinner';

const Reliquary = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reliquary, setReliquary] = useState([]);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRelicData();
    }
  }, [user, navigate]);

  const fetchRelicData = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await axios.get(`${config.BACKEND_URL}/relics/reliquary/${user._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setReliquary(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching reliquary data');
    }
  };

  return (
    <div className="" style={{ maxWidth: '1200px' }}>
      <h2 color='primary'>Relicarios de {user?.username || 'Usuario'}</h2>
      {loading && <LoadingSpinner size="large" text="Cargando..." color="primary" />}
      {(error || !loading) && <p className="error">{error}</p>}
      <div>
        {!loading && reliquary.length > 0 ? (
          reliquary.map((niche) => (
            <Button
              variant="outlined"
              text={`${niche.niche.specific}`}
              key={niche._id}
              className="niche-button"
              onClick={() => navigate(`/reliquary/${niche._id}`, { state: { relics: niche.relics } })}
            />            
          ))
        ) : (
          <p>No se encontraron reliquias para los relicarios.</p>
        )}
      </div>      
    </div>
  );
};

export default Reliquary;