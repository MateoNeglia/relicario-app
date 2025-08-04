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
import './RegisterPage.scss';

const RegisterPage = () => {
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
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

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      await googleLogin(credentialResponse.credential);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRecovery = () => {
    navigate('/login');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
      <Box className="register-page">
        <Box className="image-section" />
        <Box className="form-section">
          <Typography variant="h4" component="h2" gutterBottom>
            Registrate o ingresá para continuar
          </Typography>
          {error && (
            <Typography variant="body1" className="error">
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
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
            <Input
              label="Confirm Password"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Button
              text="Registrarse"
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
               text="Sign in with Google"
               size="large"               
               theme="outline"
               color="primary"
               width="100%"
               logo_alignment="left"
               type="standard"                              

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
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>            
                <Button
                text="Ya tengo una cuenta"
                variant="outlined"
                color="primary"
                onClick={handleNavigateToLogin}
                sx={{                                  
                  fontSize: '0.875rem',
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
                  fontSize: '0.875rem',
                  '&:hover': { 
                    background: 'rgba(72, 24, 47, 0.04)',
                    textDecoration: 'underline'
                  }
                }}
              />
          </Box>          
        </Box>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default RegisterPage;