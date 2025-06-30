import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import palette from './config/palette.js';
import App from './App.jsx';

const theme = createTheme({
  palette,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>  
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>  
  </StrictMode>
);