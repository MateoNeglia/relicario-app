import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import GoogleAuthButton from '../../../components/Button/GoogleAuthButton';
import RelicarioLogo from '../../../assets/imgs/relicario-logo.svg';
import './LoginPage.scss';

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      await login(formData.identifier, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToRecovery = () => {
    navigate('/login');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Box className="login-page">
        <Box className="navbar">
          <Button
            text=""
            onClick={() => navigate('/')}
            sx={{ 
              background: 'none', 
              border: 'none', 
              padding: 0,
              '&:hover': { background: 'none' }
            }}
          >
            <h1 className="logo">Relicario</h1>
          </Button>          
        </Box>
        <Box className="form-section">
          <Box className="form-container">
            <Typography variant="h4" component="h2" gutterBottom>
              Ingresar
            </Typography>
            {error && (
              <Typography variant="body1" className="error">
                {error}
              </Typography>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Input
                label="User o Email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <Button
                text="Ingresar"
                type="submit"
                color="primary"
                textColor="text.secondary"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Box>
                         <Box className="google-login-wrapper">
               <GoogleLogin
                 onSuccess={handleGoogleSuccess}
                 onError={handleGoogleError}
                 render={(renderProps) => (
                   <GoogleAuthButton
                     text="Sign in with Google"
                     onClick={renderProps.onClick}
                     disabled={renderProps.disabled || isSubmitting}
                     loading={isSubmitting}
                   />
                 )}
               />
             </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>            
              <Button
                text="Aún no tengo una cuenta"
                variant="outlined"
                color="primary"
                onClick={handleNavigateToRegister}
                sx={{                  
                  '&:hover': { 
                    background: 'rgba(72, 24, 47, 0.04)',
                    textDecoration: 'underline'
                  }
                }}
              />
              <Button
                text="Olvidé mi contraseña"
                variant="outlined"
                color="primary"
                onClick={handleNavigateToRecovery}
                sx={{                  
                  '&:hover': { 
                    background: 'rgba(72, 24, 47, 0.04)',
                    textDecoration: 'underline'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;