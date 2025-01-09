import { useState } from 'react';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();
    const [title] = useState('Welcome to Smart Inspect!');

    return (
        <div className='L-container'>
            <h1 className='L-title'>{title}</h1>
            <div className='L-form' style={{ alignItems: 'center', marginTop: 80, scale: 20 }}>
                <Button variant='primary' type="submit" style={{ fontSize: 28, width: 200, marginBottom: 50 }} onClick={() => navigate('/login')}>LOG IN</Button>
                <Button variant='primary-outline' type="submit" style={{ fontSize: 28, width: 200, marginBottom: 50 }} onClick={() => navigate('/signup')}>SIGN UP</Button>
            </div>
        </div >
    );
};

export default Landing;
