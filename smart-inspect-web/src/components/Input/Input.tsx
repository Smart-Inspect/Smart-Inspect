import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Input.module.css';

interface InputProps {
    variant: 'primary'; // Add more variants here
    type: 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week';
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    style?: object;
    required?: boolean;
}

const Input: React.FC<InputProps> = ({ variant, type, id, value, onChange, placeholder, className, style, required }) => {
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
            />
            {
                type === 'password' ? (
                    <button onClick={handlePasswordVisibility} className={styles['eye-icon']}>
                        {passwordHidden ? <FaEye size={15} color="#fff" /> : <FaEyeSlash size={15} color="#fff" />}
                    </button>
                ) : <></>
            }
        </div>
    );
};

//style={{ marginTop: -58, marginLeft: 285 }}

export default Input;