import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { useRequests } from "../../context/RequestsContext";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

function UserCreate() {
    const navigate = useNavigate();
    const { users } = useRequests();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordsDoNotMatch(true);
            return;
        }

        if (!await users.create(email, password, firstName, lastName)) {
            console.log('Failed to create user');
            return;
        }
        console.log('User created successfully');
        goBack();
    }

    const goBack = () => {
        navigate('/auth/users');
    }

    return (
        <div className='M-container'>
            {/* Title */}
            <h1 className='M-title'>Creating New User</h1>
            {/* Account Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
            <form onSubmit={handleSubmit}>
                <div className='M-section M-border-color'>
                    <div className='M-section-entry'>
                        <span className='M-section-content'>
                            <span className='M-section-text M-text-color'>Email</span>
                            <label htmlFor="email" className='hidden-label'>Email</label>
                            <Input
                                variant='secondary'
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                placeholder="Email"
                                required
                            />
                        </span>
                    </div>
                    <div className='M-section-entry'>
                        <span className='M-section-content'>
                            <span className='M-section-text M-text-color'>Password</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className='M-input-container'>
                                    <label htmlFor="password" className='hidden-label'>Password</label>
                                    <Input
                                        variant='secondary'
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        placeholder="New Password"
                                        required
                                    />
                                    <span className='M-text-danger'>{passwordsDoNotMatch ? 'Passwords do not match.' : ''}</span>
                                </div>
                                <div className='M-input-container'>
                                    <label htmlFor="confirmPassword" className='hidden-label'>Confirm Password</label>
                                    <Input
                                        variant='secondary'
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value) }}
                                        placeholder="Confirm New Password"
                                        required
                                    />
                                    <span className='M-text-danger'>{passwordsDoNotMatch ? 'Passwords do not match.' : ''}</span>
                                </div>
                            </div>
                        </span>
                    </div>
                    <div className='M-section-entry'>
                        <span className='M-section-content' >
                            <span className='M-section-text M-text-color'>First Name</span>
                            <label htmlFor="firstName" className='hidden-label'>First Name</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value) }}
                                placeholder="First Name"
                                required
                            />
                        </span>
                    </div>
                    <div className='M-section-entry'>
                        <span className='M-section-content' >
                            <span className='M-section-text M-text-color'>Last Name</span>
                            <label htmlFor="lastName" className='hidden-label'>Last Name</label>
                            <Input
                                variant='secondary'
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value) }}
                                placeholder="Last Name"
                                required
                            />
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                    <Button variant="secondary" type="submit">Submit</Button>
                    <Button variant="danger" type="button" onClick={goBack}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}

export default UserCreate;