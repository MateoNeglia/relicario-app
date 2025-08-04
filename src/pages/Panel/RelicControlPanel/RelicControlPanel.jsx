import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
//import EditRelicDialog from '../../../components/EditRelicDialog/EditRelicDialog';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import '../MainControlPanel.scss';
import { getProfilePictureUrl } from '../../../utils/imageUtils';
//import UpdateRelicPage from '../../Relic/UpdateRelic/UpdateRelicPage';
import UpdateRelicDialog from '../../Relic/UpdateRelic/UpdateRelicDialog';
import { config } from '../../../environments/config';

const RelicControlPanel = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [relics, setRelics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRelics, setTotalRelics] = useState(0);
  const limit = 7;

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch paginated relics
  useEffect(() => {
    const fetchRelics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please log in again.');
        }
        const response = await axios.get(`${config.BACKEND_URL}/relics/admin/relics?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!Array.isArray(response.data.relics)) {
          throw new Error('Expected an array of relics, received: ' + JSON.stringify(response.data.relics));
        }
        setRelics(response.data.relics);
        setTotalPages(response.data.totalPages);
        setTotalRelics(response.data.totalRelics);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch relics';
        setError(errorMessage);
        setRelics([]);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'admin') {
      fetchRelics();
    }
  }, [showNotification, user, page]);

  // Handle create relic
  const handleCreateRelic = async (formData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      await axios.post(`${config.BACKEND_URL}/relics/add`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setOpenCreateDialog(false);
      showNotification('Relic created successfully', 'success');
      // Refresh relic list
      const response = await axios.get(`${config.BACKEND_URL}/relics/admin/relics?page=${page}&limit=${limit}`, {
        headers: {	Field: `Bearer ${accessToken}` },
      });
      setRelics(response.data.relics);
      setTotalPages(response.data.totalPages);
      setTotalRelics(response.data.totalRelics);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error creating relic', 'error');
    }
  };

  // Handle edit relic
  const handleEditRelic = async () => {
    try {      
      setOpenEditDialog(false);
      showNotification('Relic updated successfully', 'success');
      // Refresh relic list
      
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error updating relic', 'error');
    }
  };

  // Handle delete relic
  const handleDeleteRelic = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      await axios.delete(`${config.BACKEND_URL}/relics/${selectedRelic._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      showNotification('Relic deleted successfully', 'success');
      // Close the delete dialog
      handleCloseDeleteDialog();
      // Refresh relic list
      const response = await axios.get(`${config.BACKEND_URL}/relics/admin/relics?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRelics(response.data.relics);
      setTotalPages(response.data.totalPages);
      setTotalRelics(response.data.totalRelics);
      if (response.data.relics.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error deleting relic', 'error');
    }
  };

  // Open dialogs
  const handleOpenCreateDialog = () => setOpenCreateDialog(true);
  const handleOpenEditDialog = (relic) => {
    setSelectedRelic(relic);
    setOpenEditDialog(true);
  };
  const handleOpenDeleteDialog = (relic) => {
    setSelectedRelic(relic);
    setOpenDeleteDialog(true);
  };

  // Close dialogs
  const handleCloseCreateDialog = () => setOpenCreateDialog(false);
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedRelic(null);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedRelic(null);
  };

  // Handle page change
  const handlePageChange = (event, value) => setPage(value);

  return (
    <Box className="relic-control-panel" sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relic Control Panel
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {/* <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2, mr: 2 }}>
        Create New Relic
      </Button> */}
      <Button variant="contained" color="primary" onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
        Ir al panel de control de usuarios
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>              
              <TableCell>Name</TableCell>              
              <TableCell>Niche</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Picture</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : relics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No relics found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              relics.map((relic) => (
                <TableRow key={relic._id}>                  
                  <TableCell>{relic.name?.substring(0, 25)}...</TableCell>                  
                  <TableCell>{`${relic.niche.category} - ${relic.niche.specific}`}</TableCell>
                  <TableCell>{relic.condition}</TableCell>
                  <TableCell>
                    <Avatar
                      src={getProfilePictureUrl(relic.picture)}
                      alt={relic.name}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{relic.owner.username}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditDialog(relic)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(relic)}>
                      <DeleteIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
        Mostrando {relics.length} de {totalRelics} reliquias
      </Typography>

      {/* Create Relic Dialog */}
{/*       <EditRelicDialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        relic={null}
        onSave={handleCreateRelic}
      /> */}

      {/* Edit Relic Dialog */}

      <UpdateRelicDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        relicId={selectedRelic?._id}
        onUpdate={handleEditRelic}
      />


      {/* Delete Relic Dialog */}
      <DeleteDialog
        isOpen={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteRelic}
        itemType="relic"
        itemName={selectedRelic?.name}
      />
    </Box>
  );
};

export default RelicControlPanel;