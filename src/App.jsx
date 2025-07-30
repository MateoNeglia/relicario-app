import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { NotificationProvider } from './context/NotificationContext';
import RouterComponent from './routes/RouterComponent';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <NotificationProvider>
          <BrowserRouter>
            <RouterComponent />
          </BrowserRouter>
        </NotificationProvider>        
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;