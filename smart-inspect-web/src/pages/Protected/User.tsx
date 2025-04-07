import Button from "../../components/Button/Button";
import { useCallback, useEffect, useState } from "react";
import { useRequests } from "../../context/RequestsContext";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import Popup from "../../components/Popup/Popup";
import Input from "../../components/Input/Input";

function UserView() {
    const navigate = useNavigate();
    const { users } = useRequests();
    const { id } = useParams();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [permissions, setPermissions] = useState('');
    const [accountCreated, setAccountCreated] = useState('');
    const [accountModified, setAccountModified] = useState('');
    const [deleteUserPopupVisible, setDeleteUserPopupVisible] = useState(false);
    const [inEditMode, setInEditMode] = useState(false);

    const fetchUserInfo = useCallback(async (abort?: AbortController) => {
        if (!id) {
            return;
        }

        const result = await users.view(id, abort);
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
        setAccountCreated(new Date(parseInt(result.createdAt)).toLocaleString());
        setAccountModified(new Date(parseInt(result.updatedAt)).toLocaleString());
        console.log('User info fetched successfully');
    }, [id, users]);

    const deleteUser = async () => {
        if (!id) {
            return;
        }
        if (!await users.delete(id)) {
            console.log('Failed to delete user');
            return;
        }
        setDeleteUserPopupVisible(false);
        goBack();
        console.log('User deleted successfully');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            return;
        }
        if (!await users.edit(id, email, undefined, undefined, firstName, lastName, permissions)) {
            console.log('Failed to update user info');
            return;
        }
        console.log('User info updated successfully');
        goBack();
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchUserInfo(controller);
        return () => {
            controller.abort();
        }
    }, [fetchUserInfo]);

    const goBack = () => {
        navigate(-1);
    }

    const cancel = () => {
        setInEditMode(false);
        fetchUserInfo();
    }

    return (
        <div className='M-container'>
            {/* Delete User Popup */}
            <Popup
                visible={deleteUserPopupVisible}
                onRequestClose={() => { setDeleteUserPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete user "${firstName} ${lastName}"?`}</span>
                    <br /><span className="M-text-danger">NOTE: All data created by this user will NOT be deleted</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteUser() }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteUserPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>User: {`${firstName} ${lastName}`}</h1>
            {/* Account Info */}
            <Button variant="danger" type="button" onClick={goBack} style={{ marginTop: 40, marginBottom: 15 }}>
                <div className="M-section-button-content">
                    <IoIosArrowBack className="M-icon" size={20} style={{ marginTop: 5 }} />
                    <span className='M-section-text M-text-color'>Back</span>
                </div>
            </Button>
            {
                inEditMode ? (
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
                                    <select name="permissions" id="permissions" className="M-dropdown" required onChange={(e) => { setPermissions(e.target.value) }}>
                                        <option value="engineer" className="M-section-text M-text-color" selected={permissions === 'engineer'}>Engineer</option>
                                        <option value="manager" className="M-section-text M-text-color" selected={permissions === 'manager'}>Manager</option>
                                    </select>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Account Created</span>
                                    <span className='M-section-text M-text-color'>{accountCreated}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Account Modified</span>
                                    <span className='M-section-text M-text-color'>{accountModified}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="submit">Submit</Button>
                            <Button variant="danger" type="button" onClick={cancel}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className='M-section M-border-color'>
                            <div className='M-section-entry'>
                                <span className='M-section-content'>
                                    <span className='M-section-text M-text-color'>Email</span>
                                    <span className='M-section-text M-text-color'>{email}</span>
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
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Account Created</span>
                                    <span className='M-section-text M-text-color'>{accountCreated}</span>
                                </span>
                            </div>
                            <div className='M-section-entry'>
                                <span className='M-section-content' >
                                    <span className='M-section-text M-text-color'>Account Modified</span>
                                    <span className='M-section-text M-text-color'>{accountModified}</span>
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 20 }}>
                            <Button variant="secondary" type="button" onClick={() => setInEditMode(true)}>Edit User</Button>
                            <Button variant="danger" type="button" onClick={() => { setDeleteUserPopupVisible(true); }}>Delete User</Button>
                        </div>
                    </>
                )}
        </div>
    );
}

export default UserView;