import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";
import { LiaBuildingSolid } from "react-icons/lia";
import { FaUser, FaUsers } from 'react-icons/fa';
import { IoMdSettings } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import style from './Sidebar.module.css';
import Logo from '../Logo/Logo';
import { useColor } from '../../context/ColorContext';
import { useNavigate } from 'react-router-dom';
import Popup from '../Popup/Popup';
import Button from '../Button/Button';
import { useRequests } from '../../context/RequestsContext';

const Sidebar = () => {
    const color = useColor();
    const navigate = useNavigate();
    const location = useLocation();
    const { users } = useRequests();
    const [activeTab, setActiveTab] = useState<string>('projects');
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [logoutPopupVisible, setLogoutPopupVisible] = useState<boolean>(false);

    const handleTabChange = (tab: string) => {
        navigate(`/auth/${tab}`);
    };

    const logout = async () => {
        setLogoutPopupVisible(false);
        if (!await users.logout()) {
            console.log('Failed to log out');
            return;
        }
        console.log('Logout successful');
    }

    useEffect(() => {
        const path = location.pathname.split('/')[2];
        if (path) {
            setActiveTab(path);
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth <= 960);
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={style['sidebar']}>
            { /* Logout Popup */}
            <Popup
                visible={logoutPopupVisible}
                onRequestClose={() => { setLogoutPopupVisible(false); }}
            >
                <div style={{ width: 350 }}>
                    <span className="M-popup-text M-text-color">Are you sure you want to log out?</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={logout} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setLogoutPopupVisible(false); }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            <div className={style['sidebar-header']}>
                <div className={style['sidebar-logo']} style={{ height: '0%' }}>
                    <Logo variant={color.appliedTheme === 'light' ? 'dark' : 'light'} />
                </div>
            </div>
            <div>
                <div style={{ height: 50 }}
                    className={`${style['sidebar-item']} ${style[activeTab === 'projects' ? 'active' : '']}`}
                    onClick={() => handleTabChange('projects')}>
                    <MdDashboard className="icon" />
                    {!isCollapsed && <span className={style['sidebar-text']}>Projects</span>}
                </div>
                <div style={{ height: 50 }}
                    className={`${style['sidebar-item']} ${style[activeTab === 'buildings' ? 'active' : '']}`}
                    onClick={() => handleTabChange('buildings')}>
                    <LiaBuildingSolid className="icon" />
                    {!isCollapsed && <span className={style['sidebar-text']}>Buildings</span>}
                </div>
                <div style={{ height: 50 }}
                    className={`${style['sidebar-item']} ${style[activeTab === 'users' ? 'active' : '']}`}
                    onClick={() => handleTabChange('users')}>
                    <FaUsers className="icon" />
                    {!isCollapsed && <span className={style['sidebar-text']}>Users</span>}
                </div>
                <div style={{ height: 50 }}
                    className={`${style['sidebar-item']} ${style[activeTab === 'profile' ? 'active' : '']}`}
                    onClick={() => handleTabChange('profile')}>
                    <FaUser className="icon" />
                    {!isCollapsed && <span className={style['sidebar-text']}>Profile</span>}
                </div>
                <div style={{ height: 50 }}
                    className={`${style['sidebar-item']} ${style[activeTab === 'settings' ? 'active' : '']}`}
                    onClick={() => handleTabChange('settings')}>
                    <IoMdSettings className="icon" />
                    {!isCollapsed && <span className={style['sidebar-text']}>Settings</span>}
                </div>
            </div>
            <div style={{ height: 50, marginTop: 'auto', marginBottom: 50 }}
                className={`${style['sidebar-item']}`}
                onClick={() => setLogoutPopupVisible(true)}>
                <CiLogout className="icon" />
                {!isCollapsed && <span className={style['sidebar-text']}>Log Out</span>}
            </div>
        </div>
    );
};

export default Sidebar;