import TextField from '@mui/material/TextField';

const Input = ({ label, name, type = 'text', value, onChange, required = false }) => {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth
      margin="normal"
      variant="outlined"
    />
  );
};

export default Input;