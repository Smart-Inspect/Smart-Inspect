import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequests } from '../../context/RequestsContext';

function AcceptUser() {
    const { users } = useRequests();
    const { token } = useParams();
    const [title, setTitle] = useState('Verifying Account');
    const [content, setContent] = useState('Verifying your account. Please wait...');

    useEffect(() => {
        const controller = new AbortController();
        const acceptUser = async () => {
            if (token) {
                const result = await users.acceptVerification(token, controller);
                if (result === 'success') {
                    setTitle('Account Verified');
                    setContent('You may close this window and go back to the application.');
                } else if (result === 'fail') {
                    setTitle('Error Verifying Account');
                    setContent('There was an error verifying your account. Please try again later.');
                }
            }
        };
        setTimeout(() => {
            acceptUser();
        }, 1000);
        return () => {
            controller.abort();
        };
    }, [users, token]);

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <h3 className='L-description'>{content}</h3>
        </div>
    );
};

export default AcceptUser;
