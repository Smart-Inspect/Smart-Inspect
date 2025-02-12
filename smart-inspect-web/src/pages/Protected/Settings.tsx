import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useColor } from '../../context/ColorContext';
import { useRequests } from '../../context/RequestsContext';
import { MdAutoMode as SystemIcon } from "react-icons/md";
import { IoIosSunny as LightIcon } from "react-icons/io";
import { AiFillMoon as DarkIcon } from "react-icons/ai";
import { IoMdRadioButtonOff as RadioOff, IoMdRadioButtonOn as RadioOn } from "react-icons/io";

function Settings() {
    const color = useColor();
    const auth = useAuth();
    const { users } = useRequests();
    const [loginTime, setLoginTime] = useState<string>('');
    const [accountCreated, setAccountCreated] = useState<string>('');
    const [accountModified, setAccountModified] = useState<string>('');

    const changeTheme = async (theme: 'system' | 'light' | 'dark') => {
        color.changeTheme(theme);
    };

    const fetchUserInfo = useCallback(async (abort: AbortController) => {
        const result = await users.view(auth.id as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch user info');
            return;
        }
        setAccountCreated(new Date(parseInt(result.createdAt)).toLocaleString());
        setAccountModified(new Date(parseInt(result.updatedAt)).toLocaleString());
        console.log('User info fetched successfully');
    }, [auth.id, users]);

    useEffect(() => {
        const controller = new AbortController();
        const getLoginTime = () => {
            const time = localStorage.getItem('loginTime');
            if (time) {
                setLoginTime(new Date(parseInt(time)).toLocaleString());
            }
        };
        getLoginTime();
        fetchUserInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchUserInfo]);

    return (
        <div className='M-container'>
            {/* Title */}
            <h1 className='M-title'>Settings</h1>
            {/* Theme */}
            <h2 className='M-section-header'>Theme</h2>
            <div className='M-section M-border-color' style={{ marginBottom: 80 }}>
                <div className='M-section-entry'>
                    <button
                        className='M-section-button'
                        onClick={() => changeTheme('system')}
                    >
                        <div className='M-section-button-content'>
                            <SystemIcon size={25} className='M-icon' />
                            <span className='M-section-text M-text-color'>System</span>
                        </div>
                        {color.theme === 'system' ? <RadioOn size={25} className='M-icon' /> : <RadioOff size={25} className='M-icon' />}
                    </button>
                </div>
                <div className='M-section-entry'>
                    <button
                        className='M-section-button'
                        onClick={() => changeTheme('light')}
                    >
                        <div className='M-section-button-content'>
                            <LightIcon size={25} className='M-icon' />
                            <span className='M-section-text M-text-color'>Light</span>
                        </div>
                        {color.theme === 'light' ? <RadioOn size={25} className='M-icon' /> : <RadioOff size={25} className='M-icon' />}
                    </button>
                </div>
                <div className='M-section-entry'>
                    <button
                        className='M-section-button'
                        onClick={() => changeTheme('dark')}
                    >
                        <div className='M-section-button-content'>
                            <DarkIcon size={25} className='M-icon' />
                            <span className='M-section-text M-text-color'>Dark</span>
                        </div>
                        {color.theme === 'dark' ? <RadioOn size={25} className='M-icon' /> : <RadioOff size={25} className='M-icon' />}
                    </button>
                </div>
            </div>

            {/* App Info */}
            <h2 className='M-section-header'>App Info</h2>
            <div className='M-section M-border-color' style={{ marginBottom: 80 }}>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <span className='M-section-text M-text-color'>Client Version</span>
                        <span className='M-section-text M-text-color'>1.0.0</span>
                    </span>
                </div>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <span className='M-section-text M-text-color'>Account Login</span>
                        <span className='M-section-text M-text-color'>{loginTime}</span>
                    </span>
                </div>
                <div className='M-section-entry'>
                    <span className='M-section-content' >
                        <span className='M-section-text M-text-color'>Account Created</span>
                        <span className='M-section-text M-text-color'>{accountCreated}</span>
                    </span>
                </div>
                <div className='M-section-entry'>
                    <span className='M-section-content' >
                        <span className='M-section-text M-text-color'>Account Modified</span>
                        <span className='M-section-text M-text-color'>{accountModified}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Settings;