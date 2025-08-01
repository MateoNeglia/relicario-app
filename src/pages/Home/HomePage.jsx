import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, Button as MuiButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { WhatsappShareButton } from 'react-share'; // Ensure correct import
import axios from 'axios';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../utils/imageUtils';
import './HomePage.scss';
import { config } from '../../environments/config';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedRelics = async () => {
      try {
        const accessToken = Cookies.get('accessToken');        
        if (!accessToken) {
          setError('No estás autenticado. Por favor, inicia sesión para ver recomendaciones.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.BACKEND_URL}/relics`, {
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

  // WhatsApp share configuration
  const shareUrl = 'https://relicario-app.com'; // Replace with your app's actual URL
  const shareMessage = '¡Descubre Relicario, una app increíble para intercambiar coleccionables! Descárgala aquí:';

  // Fallback manual WhatsApp link
  const whatsappMessage = encodeURIComponent(`${shareMessage} ${shareUrl}`);
  const whatsappLink = `https://wa.me/?text=${whatsappMessage}`;

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
                     <WhatsappShareButton
             url={shareUrl}
             title={shareMessage}
             separator=" "
           >
             <MuiButton
               variant="contained"
               size="large"
               startIcon={<WhatsAppIcon />}
               sx={{
                 backgroundColor: '#d4cbc4', // secondary.main
                 color: '#48182f', // primary.main
                 borderRadius: '10px',
                 '&:hover': { 
                   backgroundColor: '#b0a8a1' // secondary.dark
                 },
               }}
             >
              Recomendar
            </MuiButton>
            </WhatsappShareButton>
          {/* Fallback button if react-share fails */}
          {/* Uncomment the following if react-share continues to cause issues */}
          {/*
          <MuiButton
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#20b358' },
            }}
          >
            Recomendar
          </MuiButton>
          */}
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
                    onClick={() => navigate(`/relic/${relic._id}`)}
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
                       onClick={() => navigate(`/relic/${relic._id}`)}
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