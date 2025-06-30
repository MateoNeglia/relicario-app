import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '../../components/Button/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './LandingPage.scss';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showStrip, setShowStrip] = useState(true);


  const handleCloseStrip = () => {
    setShowStrip(false);
  };

  return (
    <Box className="landing-page">
      {showStrip && (
        <Box className="welcome-strip">
          <div className='strip-content'>
            <Typography variant="body1" className="strip-text">
              ¿Eres nuevo en Relicario? Conéctate ahora con cientos de personas que comparten tu pasión.
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
            Conecta tu Colección <br />
            ¡y consigue la reliquia que te falta!
          </Typography>
          <Button
            text="Comienza Ahora"
            component={Link}
            to="/register"
            color="secondary"
            textColor="primary"
            size="large"
          />
        </Box>
      </Box>

    </Box>
  );
};

export default LandingPage;