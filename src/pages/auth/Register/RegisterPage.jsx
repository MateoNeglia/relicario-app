import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Input from '../../../components/Input.jsx';
import Button from '../../../components/Button/Button';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Box className="navbar">
        <a href="/">
          <h1 className="logo">Relicario</h1>
        </a>        
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
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
            <Button
              text="Registrarse"
              type="submit"
              color="primary"
              textColor="text.secondary"
            />
          </Box>
          <Box className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              render={(renderProps) => (
                <Button
                  text="Sign in with Google"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  color="primary.light" 
                  textColor="text.primary"
                />
              )}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Ya tenés una cuenta? <a href="/login">Ingresar</a>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Olvidaste tu contraseña? <a href="/login">Recuperala</a>
          </Typography>
        </Box>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default RegisterPage;