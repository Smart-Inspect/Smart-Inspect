import { useCallback, useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../../context/RequestsContext";
import Input from "../../components/Input/Input";
import Popup from "../../components/Popup/Popup";
import { IUser } from "../../utils/types";

function Users() {
    const navigate = useNavigate();
    const { users } = useRequests();
    const [deleteUserPopupVisible, setDeleteUserPopupVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userList, setUserList] = useState<IUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>(userList);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredItems = userList.filter(item =>
            item.firstName.toLowerCase().includes(query.toLowerCase()) || item.lastName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filteredItems);
    }

    const deleteUser = async (user: IUser | null) => {
        if (!user) {
            return;
        }
        setDeleteUserPopupVisible(false);
        if (!await users.delete(user.id)) {
            console.log('Failed to delete user');
            return;
        }
        console.log('User deleted successfully');
    }

    const viewAllUsers = useCallback(async (abort: AbortController) => {
        const result = await users.viewAll(abort);
        if (result === 'abort') {
            return;
        }
        if (result === 'fail') {
            console.log('Failed to fetch users');
            return;
        }
        setUserList(result);
        setFilteredUsers(result);
        console.log('Users fetched successfully');
    }, [users]);

    useEffect(() => {
        const controller = new AbortController();
        viewAllUsers(controller);
        return () => {
            controller.abort();
        }
    }, [viewAllUsers]);

    return (
        <div className='M-container'>
            {/* Delete User Popup */}
            <Popup
                visible={deleteUserPopupVisible}
                onRequestClose={() => { setDeleteUserPopupVisible(false) }}
            >
                <div style={{ width: 450 }}>
                    <span className="M-popup-text M-text-color">{`Are you sure you want to delete user "${userToDelete?.firstName} ${userToDelete?.lastName}"?`}</span>
                    <br /><span className="M-text-danger">NOTE: All data created by this user will NOT be deleted</span>
                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: 75, marginTop: 35 }}>
                        <Button variant="secondary" type="button" onClick={() => { deleteUser(userToDelete) }} style={{ width: 100 }}>Yes</Button>
                        <Button variant="secondary" type="button" onClick={() => { setDeleteUserPopupVisible(false) }} style={{ width: 100 }}>No</Button>
                    </div>
                </div>
            </Popup>
            {/* Title */}
            <h1 className='M-title'>Users List</h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 40, flexWrap: 'wrap', marginTop: 20, marginBottom: 60 }}>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Total Users</span>
                    <span className='M-card-value M-text-color'>{userList.length}</span>
                </div>
                <div className='M-card M-border-color'>
                    <span className='M-card-title M-text-color'>Filtered Users</span>
                    <span className='M-card-value M-text-color'>{filteredUsers.length}</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 20, }}>
                <label htmlFor="search" className='hidden-label' style={{ fontSize: 24 }}>Search Users</label>
                <Input
                    variant='secondary'
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => { handleSearch(e.target.value) }}
                    placeholder="Search for users..."
                    className='M-section-header'
                    style={{ width: '100%', fontSize: 24 }}
                />
                <Button variant="warning" type="button" onClick={() => { navigate('/auth/users/create') }}>Add User</Button>
            </div>
            <div className='M-section M-border-color' style={{ marginBottom: 25 }}>
                {filteredUsers.map((user, index) => (
                    <div key={index} className='M-section-entry'>
                        <span className='M-section-content'>
                            <span className='M-section-text M-text-color'>{user.firstName} {user.lastName}</span>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Button variant="secondary" type="button" onClick={() => { navigate(`/auth/users/${user.id}`) }} style={{ width: 80 }}>View</Button>
                                <Button variant="danger" type="button" onClick={() => { setDeleteUserPopupVisible(true); setUserToDelete(user); }} style={{ width: 100 }}>Delete</Button>
                            </div>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;