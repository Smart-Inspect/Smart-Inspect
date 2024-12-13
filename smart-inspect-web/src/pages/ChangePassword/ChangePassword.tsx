import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './ChangePassword.css';

function ChangePassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [title, setTitle] = useState('Change Password');
    const [content, setContent] = useState('Use the form below to change your password.');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [formComplete, setFormComplete] = useState(false);

    const changePassword = async () => {
        try {
            const body = JSON.stringify({ resetToken: token, newPassword: password });
            const response = await fetch('http://localhost:3000/api/users/password-reset/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });
            if (response.status !== 204) {
                console.error('Error changing password:', response);
                setTitle('Error Changing Password');
                setContent('There was an error changing your password. Please try again later.');
            } else {
                setTitle('Password Changed');
                setContent('Your password has been changed. You may go back to the application.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setTitle('Error Changing Password');
            setContent('There was an error changing your password. Please try again later.');
        }
        setFormComplete(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordsDoNotMatch(true);
            return;
        }
        changePassword();
    };

    return (
        <div>
            <h1 className='page-title'>{title}</h1>
            <h3 className='page-content'>{content}</h3>
            {!formComplete ?
                <form onSubmit={handleSubmit} className='page-form'>
                    <label htmlFor="password" className='hidden-label'>New Password</label>
                    <Input
                        variant='primary'
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className='page-input'
                        required
                    />
                    <span style={{ color: '#ffdb4f', marginTop: -40, marginBottom: 10, fontFamily: 'Poppins', fontWeight: 200 }}>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                    <label htmlFor="confirmPassword" className='hidden-label'>Confirm New Password</label>
                    <Input
                        variant='primary'
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className='page-input'
                        required
                    />
                    <span style={{ color: '#ffdb4f', marginTop: -40, marginBottom: 20, fontFamily: 'Poppins', fontWeight: 200 }}>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                    <Button variant='primary' type="submit" className='page-button'>CHANGE</Button>
                </form>
                : null
            }
        </div >
    );
};

export default ChangePassword;