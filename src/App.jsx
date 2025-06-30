import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import RouterComponent from './routes/RouterComponent';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <RouterComponent />
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;