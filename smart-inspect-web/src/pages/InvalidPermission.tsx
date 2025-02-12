import './Unprotected/LoginStyles.css';
import Logo from '../components/Logo/Logo';
import { useEffect } from 'react';

interface InvalidPermissionProps {
    displayLogo: boolean;
}

function InvalidPermission({ displayLogo }: InvalidPermissionProps) {
    const title = 'Invalid Permissions';
    const description = 'You do not have permission to use this application. If you believe this is an error, please contact your administrator.';

    useEffect(() => {
        document.body.classList.remove('main');
        document.body.classList.add('login');
    }, []);

    if (displayLogo) {
        return (
            <div className='App'>
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

export default InvalidPermission;