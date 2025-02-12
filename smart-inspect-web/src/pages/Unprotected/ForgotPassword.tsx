import React, { useState } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';

function ForgotPassword() {
    const navigate = useNavigate();
    const { users } = useRequests();
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('Forgot Password?');
    const [content, setContent] = useState('Enter your email address below to receive a password reset link.');

    const forgotPassword = async () => {
        if (!await users.forgotPassword(email)) {
            setTitle('Error Sending Email');
            setContent('There was an error sending the email. Please try again later.');
            return;
        }
        navigate('/landing');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        forgotPassword();
    };

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <h3 className='L-description'>{content}</h3>
            <form onSubmit={handleSubmit} className='L-form'>
                <div className='L-input-container'>
                    <label htmlFor="email" className='hidden-label'>Email</label>
                    <Input
                        variant='primary'
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className='L-input'
                        required
                    />
                </div>
                <Button variant='primary' type="button" className='L-button' onClick={forgotPassword}>SEND EMAIL</Button>
                <span className='L-text'>Don't have an account? <a href='/signup' className='L-link' style={{ color: '#ffdb4f', fontWeight: 700 }}>Sign Up</a></span>
            </form>
        </div >
    );
};

export default ForgotPassword;