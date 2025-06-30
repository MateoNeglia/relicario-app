import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '../Button/Button';
import PersonIcon from '@mui/icons-material/Person';
import './NavBar.scss';

const NavBar = ({ pageType, onSearch }) => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserRole(user.role || 'user');
    } else {
      setUserRole('');
    }
  }, [user]);

  const isAuthenticated = !!user;

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const renderNavBarContent = () => {
    const isMainLogged = ['home', 'search', 'relic-page'].includes(pageType) && isAuthenticated;
    const isUserRelated = ['profile', 'reliquary', 'favourites', 'niche/add', 'relic/add', 'messages', 'admin', 'add-relic', 'reliquary', 'niche-reliquary', 'update-relic'].includes(pageType);
    const isNonLogged = !isAuthenticated || pageType === 'landing';

    if (isMainLogged) {
      return (
        <>
          <a href='/'>
            <Typography variant="h1" component="h1" className="logo">
              Relicario
            </Typography>
          </a>
          <div className="search-bar">
            <SearchBar onSearch={onSearch} />
          </div>
          <div className="actions">
            <Button
              text={user?.username || 'Profile'}
              variant="outlined"
              onClick={handleProfileClick}
              color="secondary"
              textColor="text.secondary"
            />
          </div>
        </>
      );
    } else if (isUserRelated && isAuthenticated) {
      return (
        <>
          <a href='/'>
            <Typography variant="h1" component="h1" className="logo">
              Relicario
            </Typography>
          </a>
          <div className="actions">
            <Button
              text="Volver"
              variant="outlined"
              onClick={handleBackClick}
              color="secondary"
              textColor="text.secondary"
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <a href='/'>
            <Typography variant="h1" component="h1" className="logo">
              Relicario
            </Typography>
          </a>
          <div className="actions">
            <Button
              text="Login"
              variant="outlined"
              onClick={handleLoginClick}
              color="seccondary"
              textColor="text.secondary"
            />
          </div>
        </>
      );
    }
  };

  return (
    <AppBar position="sticky" className="navbar">
      <Toolbar className="toolbar">
        {renderNavBarContent()}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;