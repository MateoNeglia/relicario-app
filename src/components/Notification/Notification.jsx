import { useNotification } from '../../context/NotificationContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Notification = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hideNotification} severity={notification.type} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;