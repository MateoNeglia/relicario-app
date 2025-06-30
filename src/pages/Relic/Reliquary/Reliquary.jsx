import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Button from '../../../components/Button/Button';


const Reliquary = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reliquary, setReliquary] = useState([]);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

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
      const response = await axios.get(`/api/relics/reliquary/${user._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setReliquary(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching reliquary data');
    }
  };

  return (
    <div className="">
      <h2 color='primary'>Relicarios de {user?.username || 'Usuario'}</h2>
      {error && <p className="error">{error}</p>}
      <div>
        {reliquary.length > 0 ? (
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
          <p>No niches found in your reliquary.</p>
        )}
      </div>      
    </div>
  );
};

export default Reliquary;