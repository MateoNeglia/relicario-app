import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Box, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../utils/imageUtils.jsx';
import './HomePage.scss';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendedRelics = async () => {
      try {
        const accessToken = Cookies.get('accessToken');        
        if (!accessToken) {
          setError('No estás autenticado. Por favor, inicia sesión para ver recomendaciones.');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/relics', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            recommend: true,
            limit: 6,
            sortBy: 'likes',
            order: 'desc',
          },
        });        
        setRelics(response.data.relics);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data, err.message);
        setError(err.response?.data?.message || 'Error al cargar las recomendaciones');
        setLoading(false);
      }
    };

    fetchRecommendedRelics();
  }, []);

  if (loading) {
    return <Typography>Cargando recomendaciones...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box className="home-page">
      <Box className="banner-section">
        <Box className="banner-overlay">
          <Typography variant="h3" component="h3" className="banner-title">
            Recomendá Relicario a tu amigo <br />
            ¡y ganá los mejores premios!
          </Typography>
          <Button
            text="Recomendar"
            component={Link}
            to="/profile"
            color="secondary"
            textColor="primary"
            size="large"
          />
        </Box>
      </Box>
      {/**separación desarrollo */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Recomendaciones para vos
        </Typography>
        {relics.length === 0 ? (
          <Typography>¡Agregá un nicho para ver recomendaciones!</Typography>
        ) : (
          <Grid className="recomendations-grid" container spacing={3}>
            {relics.map((relic) => (
              <Grid key={relic._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="350"
                    image={getImageUrl(relic.picture)}
                    alt={relic.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{relic.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {relic.niche.category} - {relic.niche.specific}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Condición: {relic.condition}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Propietario: {relic.owner.username}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => (window.location.href = `/relic/${relic._id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;