import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    variant: 'primary'; // Add more variants here
    type: 'button' | 'reset' | 'submit';
    children: React.ReactNode;
    name?: string;
    id?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    style?: object;
}

const Button: React.FC<ButtonProps> = ({ variant, name, type, children, id, onClick, disabled, className, style }) => {

    return (
        <button
            name={name}
            type={type}
            id={id}
            onClick={onClick}
            disabled={disabled}
            className={`${styles[variant]} ${className}`}
            style={style}
        >{children}
        </button>
    );
};

export default Button;