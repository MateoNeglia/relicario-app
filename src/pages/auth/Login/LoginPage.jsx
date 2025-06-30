import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Input from '../../../components/Input.jsx';
import Button from '../../../components/Button/Button';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.identifier, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Box className="login-page">
        <Box className="navbar">
          <a href="/">
            <h1 className="logo">Relicario</h1>
          </a>          
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
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                text="Login"
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
              No tienes una cuenta? <a href="/register">Regístrate</a>
            </Typography>
          </Box>
        </Box>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;