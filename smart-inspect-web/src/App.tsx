import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Routes } from 'react-router';
import VerifyUser from './pages/VerifyUser/VerifyUser';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import NotFound from './pages/NotFound/NotFound';
import './App.css';
import logo from './assets/smart-inspect_logo.png';

function App() {
  return (
    <Router>
      <div className='App'>
        <img className='App-logo' src={logo} alt="Smart Inspect Logo" />
        <h1 className='App-title'>Smart</h1>
        <h2 className='App-description'>Inspect</h2>
        <Routes>
          <Route path="/verify/:token" element={<VerifyUser />} />
          <Route path="/password-reset/:token" element={<ChangePassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
