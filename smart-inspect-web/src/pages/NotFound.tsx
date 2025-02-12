import './Unprotected/LoginStyles.css';
import Logo from '../components/Logo/Logo';
import { useEffect } from 'react';

interface NotFoundProps {
    displayLogo: boolean;
}

function NotFound({ displayLogo }: NotFoundProps) {
    const title = 'Page Not Found';
    const description = 'The page you are looking for does not exist. Please contact support if you believe this is a mistake.';

    useEffect(() => {
        document.body.classList.remove('main');
        document.body.classList.add('login');
    }, []);

    if (displayLogo) {
        return (
            <div className='L-App'>
                <Logo variant='light' />
                <h1 className='L-title'>{title}</h1>
                <h3 className='L-description'>{description}</h3>
            </div>
        );
    } else {
        return (
            <>
                <h1 className='L-title'>{title}</h1>
                <h3 className='L-description'>{description}</h3>
            </>
        );
    }
};

export default NotFound;