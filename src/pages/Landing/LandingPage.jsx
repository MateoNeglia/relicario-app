import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import Button from '../../components/Button/Button';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';
import './LandingPage.scss';
import { config } from '../../environments/config';
import LoadingSpinner from '../../components/LoadingSpinner';

const LandingPage = () => {
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStrip, setShowStrip] = useState(true);

  useEffect(() => {
    const fetchRelics = async () => {
      try {
        const response = await axios.get(`${config.BACKEND_URL}/relics`, {
          params: {
            limit: 6,
          },
        });

        console.log('Relics response:', response.data);
        setRelics(response.data.relics);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data, err.message);
        setError(err.response?.data?.message || 'Error al cargar las reliquias');
        setLoading(false);
      }
    };

    fetchRelics();
  }, []);

  const handleCloseStrip = () => {
    setShowStrip(false);
  };

  return (
    <Box className="landing-page">
      {showStrip && (
        <Box className="welcome-strip">
          <div className="strip-content">
            <Typography variant="body1" className="strip-text">
              ¿Sos nuevo en Relicario? Conectate ahora con cientos de personas que comparten tu pasión.
            </Typography>
            <Button
              text="Registrarme"
              component={Link}
              to="/register"
              color="primary"
              textColor="text.secondary"
              size="small"
            />
          </div>
          <IconButton
            className="close-button"
            onClick={handleCloseStrip}
            aria-label="Cerrar banner"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      <Box className="banner-section">
        <Box className="banner-overlay">
          <Typography variant="h3" component="h3" className="banner-title">
            Conectá tu Colección <br />
            ¡y conseguí la reliquia que te falta!
          </Typography>
          <Button
            text="Comenzá Ahora"
            component={Link}
            to="/register"
            color="secondary"
            textColor="primary"
            size="large"
          />
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Descubrí la Reliquia que te está esperando
        </Typography>
        {loading ? (
          <LoadingSpinner size="large" text="Cargando reliquias..." color="primary" />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : relics.length === 0 ? (
          <Typography>No hay reliquias disponibles para mostrar.</Typography>
        ) : (
          <Grid className="landing-recomendations" spacing={3}>
            {relics.map((relic) => (
              <Grid item xs={12} sm={6} md={4} key={relic._id}>
                <Card className='relic-card' >
                  <CardMedia
                    component="img"                    
                    image={getImageUrl(relic.picture)}
                    alt={relic.name}
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
                    </Box>                    
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                      component={Link}
                      to="/login"
                    >
                      ¡Lo quiero!
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

export default LandingPage;