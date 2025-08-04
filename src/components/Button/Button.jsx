import { useTheme } from '@mui/material/styles';
import MUIButton from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import './Button.scss';

const Button = ({
  text,
  type = 'button',
  variant = 'contained',
  color = 'primary',
  textColor,
  size = 'medium',
  component,
  to,
  onClick,
  children,
  loading = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const resolvedColor = color.includes('.')
    ? color.split('.').reduce((obj, key) => obj[key], theme.palette)
    : color;

  return (
    <MUIButton
      type={type}
      variant={variant}
      color={typeof resolvedColor === 'string' ? resolvedColor : undefined}
      size={size}
      component={component}
      className="relicario-button"
      to={to}
      disabled={loading || disabled}
      sx={{
        mt: 1,
        position: 'relative',
        ...(textColor && { color: theme.palette[textColor] || textColor }),
        ...(typeof resolvedColor !== 'string' && {
          backgroundColor: resolvedColor,
          color: theme.palette.getContrastText(resolvedColor),
        }),
      }}
      onClick={onClick}
      fullWidth={size !== 'small'}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: 'inherit',
            position: 'absolute',
            left: '50%',
            marginLeft: '-10px',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {text}
        {children}
      </span>
    </MUIButton>
  );
};

export default Button;