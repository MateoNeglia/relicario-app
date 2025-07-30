import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../utils/imageUtils';
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Recomendaciones para vos
        </Typography>
        {relics.length === 0 ? (
          <Typography>¡Agregá un nicho para ver recomendaciones!</Typography>
        ) : (
          <Grid container spacing={3} className="recomendations-grid">
            {relics.map((relic) => (
              <Grid item xs={12} sm={6} md={4} key={relic._id}>
                <Card className="relic-card">
                  <CardMedia
                    component="img"
                    image={getImageUrl(relic.picture)}
                    alt={relic.name}
                    onClick={() => (window.location.href = `/relic/${relic._id}`)}
                    sx={{
                      height: 200,
                      width: '100%',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5',
                    }}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{relic.name}</Typography>
                      <Chip
                        label={`${relic.niche.specific}`}
                        color="secondary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        Condición: <b>{relic.condition}</b>
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        Propietario: <b>{relic.owner.username}</b>
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
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