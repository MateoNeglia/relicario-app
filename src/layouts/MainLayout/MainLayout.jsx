import { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchContext } from '../../context/SearchContext';
import { AuthContext } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import NavBar from '../../components/NarBar/Navbar';
import LandingPage from '../../pages/Landing/LandingPage';
import HomePage from '../../pages/Home/HomePage';
import ProfilePage from '../../pages/Profile/ProfilePage';
import SearchResultsPage from '../../pages/SearchResults/SearchResultsPage';
import AddRelicPage from '../../pages/Relic/AddRelic/AddRelicPage';
import UpdateRelicPage from '../../pages/Relic/UpdateRelic/UpdateRelicPage';
import Reliquary from '../../pages/Relic/Reliquary/Reliquary';
import NicheReliquary from '../../pages/Relic/NicheReliquary/NicheReliquary';
import MainControlPanel from '../../pages/Panel/MainControlPanel';
import RelicControlPanel from '../../pages/Panel/RelicControlPanel/RelicControlPanel';
import RelicPage from '../../pages/Relic/Relic/RelicPage';
import FavouritesPage from '../../pages/Profile/Favourites/FavouritesPage';
import ChatPage from '../../pages/Chat/ChatPage';
import './MainLayout.scss';

const MainLayout = ({ page }) => {
  const searchContext = useContext(SearchContext);
  const userContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();   

//collector-profile


  if (!searchContext) {
    console.error('MainLayout: SearchContext is undefined');
    return <div>Error: SearchContext not available</div>;
  }

  const { updateSearchParams } = searchContext;

  const handleSearch = ({ query, filters, sort }) => {    
    updateSearchParams({ query, filters, sort });
    navigate('/search');
  };

  const handleToggleView = (page) => {      
    switch (page) {
      case 'landing':
        return <LandingPage />;
      case 'home':
        return <HomePage />;
      case 'profile':
        return <ProfilePage />;
      case 'favourites':
        return <FavouritesPage user={userContext.user} onNavigate={navigate}/>;
      case 'collector-profile':
        return <ProfilePage userId={id}/>;
      case 'search':
        return <SearchResultsPage />;
      case 'relic-page':
        return <RelicPage relicId={id} user={userContext.user} onNavigate={navigate}/>;
      case 'add-relic':
        return <AddRelicPage />;
      case 'update-relic':
        return <UpdateRelicPage relicId={id}/>;
      case 'reliquary':
        return <Reliquary />;
      case 'niche-reliquary':
        return <NicheReliquary reliquaryId={id}/>;
      case 'chat':
        return <ChatPage user={userContext.user} chatId={id} onNavigate={navigate} />;
      case 'admin':
        return <MainControlPanel />;
      case 'relic-control':
        return <RelicControlPanel />;
      default:        
        return <LandingPage />;
    }
  };

  return (
    <Box className="main-layout">
      <NavBar pageType={page} onSearch={handleSearch} />
      <Box component="main" className="main-content">
        {handleToggleView(page)}
      </Box>
    </Box>
  );
};

export default MainLayout;