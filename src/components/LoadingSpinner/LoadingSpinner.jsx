import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import './LoadingSpinner.scss';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className = '',
}) => {
  const theme = useTheme();
  
  // Size mapping
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
    xlarge: 80,
  };
  
  // Color mapping
  const getColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'white') return '#ffffff';
    return color; // Allow custom colors
  };

  const spinnerContent = (
    <Box className={`loading-spinner ${className}`}>
      <CircularProgress
        size={sizeMap[size]}
        sx={{
          color: getColor(),
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {text && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: getColor(),
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        {spinnerContent}
      </Box>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000,
        }}
      >
        {spinnerContent}
      </Box>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner; 