import React, { useState } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';

function SignUp() {
    const navigate = useNavigate();
    const { users } = useRequests();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [title, setTitle] = useState('Create New Account');
    const [content, setContent] = useState('Please create a new account using this form.');

    const signup = async () => {
        if (password !== confirmPassword) {
            setPasswordsDoNotMatch(true);
            return;
        }

        if (await users.create(email, password, firstName, lastName)) {
            navigate('/login');
        } else {
            setTitle('Error Signing Up');
            setContent('There was an error signing up. Please try again later.');
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signup();
    };

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <h3 className='L-description'>{content}</h3>
            <form onSubmit={handleSubmit} className='L-form'>
                <div className='L-input-container'>
                    <label htmlFor="firstName" className='hidden-label'>First Name</label>
                    <Input
                        variant='primary'
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className='L-input'
                        required
                    />
                </div>
                <div className='L-input-container'>
                    <label htmlFor="lastName" className='hidden-label'>Last Name</label>
                    <Input
                        variant='primary'
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className='L-input'
                        required
                    />
                </div>
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
                <div className='L-input-container'>
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
                    <span className='L-error'>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                </div>
                <div className='L-input-container'>
                    <label htmlFor="confirmPassword" className='hidden-label'>Confirm Password</label>
                    <Input
                        variant='primary'
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className='L-input'
                        required
                        forceWhite
                    />
                    <span className='L-error'>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</span>
                </div>
                <Button variant='primary' type="submit" className='L-button'>SIGN UP</Button>
                <span className='L-text'>Have an account? <a href='/login' className='L-link' style={{ color: '#ffdb4f', fontWeight: 700 }}>Log In</a></span>
            </form>
        </div >
    );
};

export default SignUp;