import './Unprotected/LoginStyles.css';
import { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Routes, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo/Logo';
import Landing from './Unprotected/Landing';
import LogIn from './Unprotected/LogIn';
import SignUp from './Unprotected/SignUp';
import ForgotPassword from './Unprotected/ForgotPassword';
import ResetPassword from './Unprotected/ResetPassword';
import VerifyUser from './Unprotected/VerifyUser';
import AcceptUser from './Unprotected/AcceptUser';
import NotFound from './NotFound';
import InvalidPermission from './InvalidPermission';

function UnprotectedRouter() {
    const auth = useAuth();
    const navigate = useNavigate();

    // Swap classes on body element to change background color
    useEffect(() => {
        document.body.classList.remove('main');
        document.body.classList.add('login');
    }, []);

    // Check if user is authenticated and verified
    useEffect(() => {
        if (auth.isAuthenticated && auth.isVerified && window.location.pathname !== '/auth/projects') {
            navigate('/auth/projects');
        } else if (auth.isAuthenticated && !auth.isVerified && window.location.pathname !== '/verify') {
            console.log('User is authenticated but not verified, redirecting to /verify');
            navigate('/verify');
        }
    }, [auth.isAuthenticated, auth.isVerified, navigate]);

    return (
        <div className='L-App'>
            <Logo variant='light' />
            <Routes>
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify" element={<VerifyUser />} />
                <Route path="/verify/:token" element={<AcceptUser />} />
                <Route path="/invalid-permission" element={<InvalidPermission displayLogo={false} />} />
                <Route path="*" element={<NotFound displayLogo={false} />} />
            </Routes>
        </div>
    );
}

export default UnprotectedRouter;
