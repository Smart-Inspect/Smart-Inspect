import React, { useState, useEffect } from 'react';
import style from './NotificationBar.module.css';
import { IoIosClose } from "react-icons/io";

interface NotificationBarProps {
    variant: 'success' | 'error' | 'warning';
    message: string;
    duration?: number;
}

const NotificationBar = ({ variant, message, duration = 5000 }: NotificationBarProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timeout);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <div className={`${style['notification-bar']} ${style['notification-bar-left']} ${isVisible ? style['visible'] : ''}`} style={{ backgroundColor: variant === 'success' ? '#4CAF50' : variant === 'error' ? '#f73527' : '#d8a60f' }}>
            <p>{message}</p>
            <button className={style['close-btn']} onClick={handleClose}>
                <IoIosClose size={35} />
            </button>
        </div>
    );
};

export default NotificationBar;

//✖