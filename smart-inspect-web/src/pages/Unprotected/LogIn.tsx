import React, { useState } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useRequests } from '../../context/RequestsContext';

function LogIn() {
    const { users } = useRequests();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [title, setTitle] = useState('Hi! Welcome back!');
    const [content, setContent] = useState('Please log in using this form.');

    const login = async () => {
        if (!await users.login(email, password)) {
            setTitle('Incorrect Email or Password');
            setContent('Please try again.');
        }

        localStorage.setItem('loginTime', new Date().getTime().toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login();
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
                <div className='L-input-container' style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="password" className='hidden-label'>Password</label>
                    <Input
                        variant='primary'
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className='L-input'
                        required
                        forceWhite
                    />
                    <a href='/forgot-password' className='L-link' style={{ alignSelf: 'flex-end', marginTop: 10 }}>Forgot Password?</a>
                </div>
                <Button variant='primary' type="submit" className='L-button'>LOG IN</Button>
                <span className='L-text'>Don't have an account? <a href='/signup' className='L-link' style={{ color: '#ffdb4f', fontWeight: 700 }}>Sign Up</a></span>
            </form>
        </div >
    );
};

export default LogIn;