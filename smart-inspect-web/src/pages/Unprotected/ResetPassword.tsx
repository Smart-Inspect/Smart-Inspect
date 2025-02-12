import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useRequests } from '../../context/RequestsContext';

function ChangePassword() {
    const { users } = useRequests();
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [title, setTitle] = useState('Change Password');
    const [content, setContent] = useState('Use the form below to change your password.');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [formComplete, setFormComplete] = useState(false);

    const resetPassword = async () => {
        if (token) {
            if (await users.resetPassword(token, password)) {
                setTitle('Password Changed');
                setContent('Your password has been changed. You may close this window and go back to the application.');
            } else {
                setTitle('Error Changing Password');
                setContent('There was an error changing your password. Please try again later.');
            }

            setFormComplete(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordsDoNotMatch(true);
            return;
        }
        resetPassword();
    };

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <h3 className='L-description'>{content}</h3>
            {!formComplete ?
                <form onSubmit={handleSubmit} className='L-form'>
                    <div className='L-input-container'>
                        <label htmlFor="password" className='hidden-label'>New Password</label>
                        <Input
                            variant='primary'
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className='L-input'
                            required
                            forceWhite
                        />
                        <span className='L-error'>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                    </div>
                    <div className='L-input-container'>
                        <label htmlFor="confirmPassword" className='hidden-label'>Confirm New Password</label>
                        <Input
                            variant='primary'
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className='L-input'
                            required
                            forceWhite
                        />
                        <span className='L-error'>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                    </div>
                    <Button variant='primary' type="submit" className='L-button'>CHANGE</Button>
                </form>
                : null
            }
        </div>
    );
};

export default ChangePassword;