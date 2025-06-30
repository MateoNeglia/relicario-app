import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Button from '../Button/Button';

const DeleteDialog = ({ isOpen, onClose, onConfirm, itemType = 'relic' }) => {
  const getItemLabel = () => {
    switch (itemType) {
      case 'niche':
        return 'este nicho';
      case 'user':
        return 'tu cuenta';
      case 'relic':
      default:
        return 'esta reliquia';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: { color: '#131313' },
      }}
    >
      <DialogTitle id="alert-dialog-title">Confirmar Borrar</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" sx={{ color: '#131313' }}>
          ¿Estás seguro de que quieres borrar {getItemLabel()}? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="outlined" 
          color="primary"
          text="Cancelar"
          onClick={onClose}
        />
        <Button 
          variant="contained" 
          color="primary"
          text="Borrar"
          onClick={onConfirm}
          autoFocus
        />        
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;