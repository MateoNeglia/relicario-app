import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '../../components/Button/Button';
import Box from '@mui/material/Box';
import './HomePage.scss';

const HomePage = () => {
  
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
    </Box>
  );
};

export default HomePage;