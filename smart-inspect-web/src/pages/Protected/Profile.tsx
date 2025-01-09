import { useCallback, useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import Popup from "../../components/Popup/Popup";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestsContext";
import Input from "../../components/Input/Input";

function Profile() {
    const auth = useAuth();
    const { users } = useRequests();
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
    const [deleteAccountPopupVisible, setDeleteAccountPopupVisible] = useState(false);
    const [inEditMode, setInEditMode] = useState(false);
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState<string | undefined>(undefined);
    const [newPassword, setNewPassword] = useState<string | undefined>(undefined);
    const [confirmNewPassword, setConfirmNewPassword] = useState<string | undefined>(undefined);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [permissions, setPermissions] = useState('');
    const [mustSetOldPassword, setMustSetOldPassword] = useState(false);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);

    const openEditMode = () => {
        setOldPassword(undefined);
        setNewPassword(undefined);
        setConfirmNewPassword(undefined);
        setMustSetOldPassword(false);
        setPasswordsDoNotMatch(false);
        setInEditMode(true);
    }

    const openPopup = (type: string) => {
        if (type === 'logout') {
            setLogoutPopupVisible(true);
        } else if (type === 'delete') {
            setDeleteAccountPopupVisible(true);
        }
    }
    const closePopup = (type: string) => {
        if (type === 'logout') {
            setLogoutPopupVisible(false);
        } else if (type === 'delete') {
            setDeleteAccountPopupVisible(false);
        }
    }

    const fetchUserInfo = useCallback(async (abort?: AbortController) => {
        const result = await users.view(auth.id as string, abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch user info');
            return;
        }
        setEmail(result.email);
        setFirstName(result.firstName);
        setLastName(result.lastName);
        setPermissions(result.permissionLevel);
        console.log('User info fetched successfully');
    }, [auth.id, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((oldPassword === undefined || oldPassword.length === 0) && (newPassword !== undefined || confirmNewPassword !== undefined)) {
            setMustSetOldPassword(true);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            console.log('Passwords do not match');
            setPasswordsDoNotMatch(true);
            return;
        }
        setInEditMode(false);
        if (!await users.edit(auth.id as string, email, oldPassword, newPassword, firstName, lastName, permissions)) {
            console.log('Failed to update user info');
            return;
        }
        console.log('User info updated successfully');
    }

    const logout = async () => {
        closePopup('logout');
        if (!await users.logout()) {
            console.log('Failed to log out');
            return;
        }
        console.log('Logout successful');
    }

    const deleteAccount = async () => {
        closePopup('delete');
        if (!await users.delete(auth.id as string)) {
            console.log('Failed to delete account');
            return;
        }
        console.log('Account deleted successfully');
    }

    const cancel = () => {
        setInEditMode(false);
        fetchUserInfo();
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchUserInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchUserInfo]);

    return (
        <div className='M-container'>
            { /* Logout Popup */}
            <Popup
                visible={logoutPopupVisible}
                onRequestClose={() => { closePopup('logout') }}
            >
                <div style={{ width: 350 }}>
                    <span className="M-popup-text M-text-color">Are you sure you want to log out?</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={logout} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { closePopup('logout') }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            { /* Delete Account Popup */}
            <Popup
                visible={deleteAccountPopupVisible}
                onRequestClose={() => { closePopup('delete') }}
            >
                <div style={{ width: 350 }}>
                    <span className="M-popup-text M-text-color">Are you sure you want to delete your account?</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={deleteAccount} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { closePopup('delete') }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>

            {/* Title */}
            <h1 className='M-title'>Profile</h1>
            {/* Account Info */}
            <h2 className='M-section-header'>Account Info</h2>
            {
                inEditMode ?
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
                                            <label htmlFor="oldPassword" className='hidden-label'>Old Password</label>
                                            <Input
                                                variant='secondary'
                                                type="password"
                                                id="oldPassword"
                                                value={oldPassword}
                                                onChange={(e) => { setOldPassword(e.target.value) }}
                                                placeholder="Old Password"
                                            />
                                            <span className='M-text-danger'>{mustSetOldPassword ? 'This field is required.' : ''}</span>
                                        </div>
                                        <div className='M-input-container'>
                                            <label htmlFor="newPassword" className='hidden-label'>New Password</label>
                                            <Input
                                                variant='secondary'
                                                type="password"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => { setNewPassword(e.target.value) }}
                                                placeholder="New Password"
                                                required={oldPassword !== undefined && oldPassword.length > 0}
                                            />
                                            <span className='M-text-danger'>{passwordsDoNotMatch ? 'Passwords do not match.' : ''}</span>
                                        </div>
                                        <div className='M-input-container'>
                                            <label htmlFor="confirmNewPassword" className='hidden-label'>Confirm New Password</label>
                                            <Input
                                                variant='secondary'
                                                type="password"
                                                id="confirmNewPassword"
                                                value={confirmNewPassword}
                                                onChange={(e) => { setConfirmNewPassword(e.target.value) }}
                                                placeholder="Confirm New Password"
                                                required={oldPassword !== undefined && oldPassword.length > 0}
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
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Permissions</span>
                                    <label htmlFor="permissions" className='hidden-label'>Permissions</label>
                                    <select name="permissions" id="permissions" className="M-dropdown" required>
                                        <option value="manager" className="M-section-text M-text-color" selected={permissions === 'engineer'}>Engineer</option>
                                        <option value="engineer" className="M-section-text M-text-color" selected={permissions === 'manager'}>Manager</option>
                                    </select>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="submit">Submit</Button>
                            <Button variant="danger" type="button" onClick={cancel}>Cancel</Button>
                        </div>
                    </form>
                    :
                    <>
                        <div className='M-section M-border-color'>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Email</span>
                                    <span className='M-section-text M-text-color'>{email}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Password</span>
                                    <span className='M-section-text M-text-color'>**********</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>First Name</span>
                                    <span className='M-section-text M-text-color'>{firstName}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Last Name</span>
                                    <span className='M-section-text M-text-color'>{lastName}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Permissions</span>
                                    <span className='M-section-text M-text-color'>{`${permissions.charAt(0).toUpperCase()}${permissions.slice(1)}`}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={() => { openEditMode() }}>Edit Profile</Button>
                        </div>
                    </>
            }

            {/* Account Actions */}
            <h2 className='M-section-header' style={{ marginBottom: 30 }}>Account Actions</h2>
            <p className='M-section-description M-text-color'>Logging out of your account will unregister this device as a logged-in device.</p>
            <div className='M-section M-border-color' style={{ marginBottom: 80 }}>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <span className='M-section-text M-text-color'>Log Out of Account</span>
                        <Button variant="secondary" type="button" onClick={() => { openPopup('logout') }} style={{ width: 115 }}>Log Out</Button>
                    </span>
                </div>
            </div>

            <p className='M-section-description M-text-danger'>Deleting your account will permanently remove all data associated with it.</p>
            <div className='M-section M-border-danger' style={{ marginBottom: 80 }}>
                <div className='M-section-entry'>
                    <span className='M-section-content'>
                        <span className='M-section-text M-text-danger'>Delete Your Account</span>
                        <Button variant="danger" type="button" onClick={() => { openPopup('delete') }} style={{ width: 115 }}>Delete</Button>
                    </span>
                </div>
            </div>

        </div>
    );
}

export default Profile;