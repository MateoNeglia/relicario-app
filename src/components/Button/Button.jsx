import { useTheme } from '@mui/material/styles';
import MUIButton from '@mui/material/Button';
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
      sx={{
        mt: 2,
        ...(textColor && { color: theme.palette[textColor] || textColor }),
        ...(typeof resolvedColor !== 'string' && {
          backgroundColor: resolvedColor,
          color: theme.palette.getContrastText(resolvedColor),
        }),
      }}
      onClick={onClick}
      fullWidth={size !== 'small'}
    >
      {text}
      {children}
    </MUIButton>
  );
};

export default Button;