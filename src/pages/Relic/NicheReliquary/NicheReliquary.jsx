import { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import { getImageUrl } from '../../../utils/imageUtils';
import DeleteDialog from '../../../components/DeleteDialog/DeleteDialog';
import './NicheReliquary.scss';
import Button from '../../../components/Button/Button';

const NicheReliquary = ({ reliquaryId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const initialRelics = Array.isArray(location.state?.relics) ? location.state.relics : location.state?.relics ? [location.state.relics] : [];
  const [relics, setRelics] = useState(initialRelics);
  const [niche, setNiche] = useState({ category: '', specific: '' });
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRelicId, setSelectedRelicId] = useState(null);

  useEffect(() => {
    console.log('NicheReliquary: user=', user, 'reliquaryId=', reliquaryId);
    for (const reliquary of user.reliquaryLists) {
      if (reliquary._id === reliquaryId) {
        setNiche(reliquary.niche || { category: '', specific: '' });
      }
    }
  }, [user, reliquaryId]);

  const handleOpenDeleteDialog = (relicId) => {
    setSelectedRelicId(relicId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedRelicId(null);
  };

  const handleDeleteRelic = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('No access token found');
        return;
      }
      await axios.delete(`/api/relics/${selectedRelicId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRelics(relics.filter((relic) => relic._id !== selectedRelicId));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete relic');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <div className="niche-reliquary">
      <h2>Relicario de: {niche?.specific || 'Specific'}</h2>
      {error && <p className="error">{error}</p>}
      <div className='reliquary-details'>
        {relics.length > 0 ? (
          relics.map((relic) => (
            <div key={relic._id} className="relic-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column' }}>
                <h3>{relic.name}</h3>
                <div className="relic-image">
                  <img
                    src={getImageUrl(relic.picture)}
                    alt={relic.name}
                    width={100}
                  />
                </div>
                <div className="relic-info">
                  <Button
                    variant="contained"
                    color="primary"
                    text="Editar"
                    onClick={() => navigate(`/relic/update/${relic._id}`)}
                    style={{ marginRight: '10px' }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    text="Borrar"
                    onClick={() => handleOpenDeleteDialog(relic._id)}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>
            <p>Add a relic to this reliquary</p>
            <Button
              variant="contained"
              color="primary"
              text="Add Relic"
              onClick={() => navigate('/relic/add')}
            />
          </div>
        )}
      </div>
      <Button
        variant="outlined"
        color="primary"
        text="Volver a los Relicarios"
        onClick={() => navigate('/reliquary')}
      />
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteRelic}
        itemType="relic"
      />
    </div>
  );
};

export default NicheReliquary;