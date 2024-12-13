import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VerifyUser.css';

function VerifyNewUser() {
    const { token } = useParams();
    const [title, setTitle] = useState('Verifying Account');
    const [content, setContent] = useState('Verifying your account. Please wait...');

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const body = JSON.stringify({ verifyToken: token });
                const response = await fetch('http://localhost:3000/api/users/verify/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });
                if (response.status !== 204) {
                    console.error('Error verifying user:', response);
                    console.log('Response body:', await response.json().then(data => data.body));
                    setTitle('Error Verifying Account');
                    setContent('There was an error verifying your account. Please try again later.');
                } else {
                    console.log('User verified');
                    setTitle('Account Verified');
                    setContent('You may go back to the application.');
                }
            } catch (error) {
                console.error('Error verifying user:', error);
            }
        };
        setTimeout(() => {
            verifyUser();
        }, 1000);
    }, [token]);

    return (
        <div>
            <h1 className='page-title'>{title}</h1>
            <h3 className='page-content'>{content}</h3>
        </div >
    );
};

export default VerifyNewUser;
