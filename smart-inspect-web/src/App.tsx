import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Navigate, Routes } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { APIProvider } from './context/APIContext';
import { RequestsProvider } from './context/RequestsContext';
import ProtectedRouter from './pages/ProtectedRouter';
import UnprotectedRouter from './pages/UnprotectedRouter';

function App() {
  return (
    <AuthProvider>
      <Router>
        <APIProvider>
          <RequestsProvider>
            <Routes>
              <Route path='/' element={<Navigate to='/auth' />} />
              <Route path="auth/*" element={<ProtectedRouter />} />
              <Route path="*" element={<UnprotectedRouter />} />
            </Routes>
          </RequestsProvider>
        </APIProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
