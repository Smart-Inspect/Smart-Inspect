import React, { useEffect, useState } from 'react';
import styles from './Popup.module.css';

interface ModalProps {
    visible: boolean;
    onRequestClose?: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<ModalProps> = ({ visible, onRequestClose, children }: ModalProps) => {
    const [backgroundClick, setBackgroundClick] = useState(false);
    const [centerClick, setCenterClick] = useState(false);

    useEffect(() => {
        const handleClose = () => {
            if (onRequestClose) {
                onRequestClose();
            }
        };

        if (backgroundClick && !centerClick) {
            handleClose();
            setBackgroundClick(false);
        } else {
            setCenterClick(false);
            setBackgroundClick(false);
        }
    }, [backgroundClick, centerClick, onRequestClose]);

    return (
        visible ? (
            <div className={styles['modal-overlay']} onClick={() => setBackgroundClick(true)}>
                <div className={styles['modal-content']} onClick={() => setCenterClick(true)}>
                    {children}
                </div>
            </div >
        ) : null
    );
};

export default Popup;