import './Protected/MainStyles.css';
import { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Routes } from 'react-router';
import { ColorProvider } from '../context/ColorContext';
import { useAPI } from '../context/APIContext';
import { useRequests } from '../context/RequestsContext';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Spinner from '../components/Spinner/Spinner';
import Projects from './Protected/Projects';
import Project from './Protected/Project';
import ProjectCreate from './Protected/ProjectCreate';
import Buildings from './Protected/Buildings';
import Building from './Protected/Building';
import BuildingCreate from './Protected/BuildingCreate';
import Users from './Protected/Users';
import User from './Protected/User';
import UserCreate from './Protected/UserCreate';
import Profile from './Protected/Profile';
import Settings from './Protected/Settings';
import NotFound from './NotFound';
import NotificationBar from '../components/NotificationBar/NotificationBar';

function ProtectedRouter() {
    const api = useAPI();
    const { notification } = useRequests();

    // Swap classes on body element to change background color
    useEffect(() => {
        document.body.classList.remove('login');
        document.body.classList.add('main');
    }, []);

    // Check if user is authenticated and verified
    useEffect(() => {
        const controller = new AbortController();
        const authCheck = async () => {
            const response = await api.request('auth', 'GET', undefined, true, controller);
            if (response.status === 200) {
                console.log('Authenticated and Verified: ' + response.data.message);
            } else if (response.status === 401) {
                console.log('Not Authenticated and/or Verified');
            }
        }
        authCheck();

        return () => {
            controller.abort();
        }
    }, [api]);

    // Check if the user has the proper permissions (manager)
    useEffect(() => {
        const controller = new AbortController();
        const permissionCheck = async (role: string) => {
            const response = await api.request(`auth/permission/${role}`, 'GET', undefined, true, controller);
            if (response.status === 200) {
                console.log('Manager: ' + response.data.message);
            } else if (response.status === 403) {
                console.log('Not a Manager');
            }
        }
        permissionCheck('manager');

        return () => {
            controller.abort();
        }
    }, [api, api.request]);

    return (
        <ColorProvider>
            <div className='M-App'>
                <Sidebar />
                <div className='M-App-Content'>
                    {notification && notification.isVisible ?
                        <div>
                            <NotificationBar variant={notification.variant} message={notification.message} />
                        </div>
                        : null
                    }
                    {
                        api.loading ?
                            <div className='M-container'>
                                <Spinner />
                            </div>
                            :
                            <Routes>
                                <Route path="/" element={<Navigate to='/auth/projects' />} />
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/projects/:id" element={<Project />} />
                                <Route path="/projects/create" element={<ProjectCreate />} />
                                <Route path="/buildings" element={<Buildings />} />
                                <Route path="/buildings/:id" element={<Building />} />
                                <Route path="/buildings/create" element={<BuildingCreate />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/users/:id" element={<User />} />
                                <Route path="/users/create" element={<UserCreate />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<NotFound displayLogo={true} />} />
                            </Routes>
                    }
                </div>
            </div>
        </ColorProvider >
    );
}

export default ProtectedRouter;
