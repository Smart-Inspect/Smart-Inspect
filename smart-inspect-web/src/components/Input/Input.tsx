import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Input.module.css';

interface InputProps {
    variant: 'primary' | 'secondary'; // Add more variants here
    type: 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week';
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    style?: object;
    required?: boolean;
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;
    forceWhite?: boolean; // This is to fix a bug on the login/signup pages where the eye icon stays black
}

const Input: React.FC<InputProps> = ({ variant, type, id, value, onChange, placeholder, className, style, required, multiple, accept, disabled, forceWhite }) => {
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [typeWithPassword, setTypeWithPassword] = useState(type);

    function handlePasswordVisibility() {
        setPasswordHidden(!passwordHidden);
        setTypeWithPassword(typeWithPassword === 'password' ? 'text' : 'password');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }} >
            <input
                type={typeWithPassword}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={style}
                required={required}
                className={`${styles[variant]} ${className}`}
                disabled={disabled}
                multiple={multiple}
                accept={accept ? accept : 'image/*'}
            />
            {
                type === 'password' ? (
                    <button onClick={handlePasswordVisibility} className={styles['eye-icon-button']} type='button'>
                        {passwordHidden ? <FaEye size={15} className={document.body.classList.contains('login') || forceWhite ? styles['eye-icon-login'] : styles['eye-icon-main']} /> : <FaEyeSlash size={15} className={document.body.classList.contains('login') ? styles['eye-icon-login'] : styles['eye-icon-main']} />}
                    </button>
                ) : <></>
            }
        </div>
    );
};

export default Input;