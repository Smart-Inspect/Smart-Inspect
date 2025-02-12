import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import { useRequests } from '../../context/RequestsContext';
import { useAuth } from '../../context/AuthContext';
import { useAPI } from '../../context/APIContext';

function VerifyUser() {
    const auth = useAuth();
    const api = useAPI();
    const { users } = useRequests();
    const [title, setTitle] = useState('Please Verify Your Account');
    const [content, setContent] = useState('We have sent you an email with a verification link. Please click on the link to verify your account. If you did not receive the email, please click the button below to resend the email.');
    const [sentInitialEmail, setSentInitialEmail] = useState(false);

    const resendVerifyEmail = useCallback(async (abort?: AbortController) => {
        if (sentInitialEmail && abort) {
            return;
        }

        console.log('Resending verification email');
        const response = await users.sendVerificationEmail(abort);

        if (response !== 'abort') {
            setSentInitialEmail(true);
        }

        if (response === 'success') {
            setTitle('Please Verify Your Account');
            setContent('We have sent you an email with a verification link. Please click on the link to verify your account. If you did not receive the email, please click the button below to resend the email.');
        } else if (response === 'fail') {
            setTitle('Error Resending Email');
            setContent('There was an error resending the email. Please try again later.');
        }
    }, [sentInitialEmail, users]);

    useEffect(() => {
        console.log('VerifyUser Mounted');
        const controller = new AbortController();

        const intervalId = setInterval(async () => {
            console.log('Checking verification status');
            await users.checkVerification();
        }, 5000);

        resendVerifyEmail(controller);

        return () => {
            console.log('VerifyUser Unmounted');
            clearInterval(intervalId);
            controller.abort();
        };
    }, [api, auth, resendVerifyEmail, users]);

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <h3 className='L-description'>{content}</h3>
            <div className='L-container'>
                <Button variant='primary' type="button" className='L-button' style={{ alignSelf: 'center' }} onClick={() => { resendVerifyEmail() }}>SEND EMAIL</Button>
            </div>
        </div>
    );
};

export default VerifyUser;
