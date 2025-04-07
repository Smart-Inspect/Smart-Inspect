import Button from '@/components/Button';
import Popup from '@/components/Popup';
import { useAuth } from '@/context/AuthContext';
import { ColorTypes, useColor } from '@/context/ColorContext';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRequests } from '@/context/RequestsContext';
import { IUser } from '@/utils/types';
import InputField from '@/components/InputField';

interface ProfileScreenProps {
    user: IUser;
}

export default function ProfileScreen({ user }: ProfileScreenProps) {
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
    const [deleteAccountPopupVisible, setDeleteAccountPopupVisible] = useState(false);
    const color = useColor();
    const styles = getStyles(color.getColors());
    const auth = useAuth();
    const { users } = useRequests();
    const [inEditMode, setInEditMode] = useState(false);
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState<string | undefined>();
    const [newPassword, setNewPassword] = useState<string | undefined>();
    const [confirmNewPassword, setConfirmNewPassword] = useState<string | undefined>();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mustSetOldPassword, setMustSetOldPassword] = useState(false);
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [requiredFieldEmpty, setRequiredFieldEmpty] = useState({ firstName: false, lastName: false, email: false, newPassword: false, confirmNewPassword: false });

    const openEditMode = () => {
        setOldPassword(undefined);
        setNewPassword(undefined);
        setConfirmNewPassword(undefined);
        setMustSetOldPassword(false);
        setPasswordsDoNotMatch(false);
        setInEditMode(true);
    }

    const fetchProfileInfo = useCallback(async (abort?: AbortController) => {
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
        console.log('User info fetched successfully');
    }, []);

    const openPopup = (type: string) => {
        if (type === 'logout') {
            setLogoutPopupVisible(true);
        } else if (type === 'delete') {
            setDeleteAccountPopupVisible(true);
        }
    }
    const closePopup = (type: 'logout' | 'delete') => {
        if (type === 'logout') {
            setLogoutPopupVisible(false);
        } else if (type === 'delete') {
            setDeleteAccountPopupVisible(false);
        }
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

    const handleSubmit = async () => {
        console.log("Submitting");

        setMustSetOldPassword(false);
        setPasswordsDoNotMatch(false);
        setRequiredFieldEmpty({ firstName: false, lastName: false, email: false, newPassword: false, confirmNewPassword: false });

        if (firstName === '') {
            console.log('First Name is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, firstName: true });
            return;
        }
        if (lastName === '') {
            console.log('Last Name is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, lastName: true });
            return;
        }
        if (email === '') {
            console.log('Email is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, email: true });
            return;
        }

        if ((oldPassword === undefined || oldPassword.length === 0) && ((newPassword !== undefined && newPassword.length > 0) || (confirmNewPassword !== undefined && confirmNewPassword.length > 0))) {
            console.log('Old password is required');
            setMustSetOldPassword(true);
            return;
        }

        if (((newPassword === undefined || newPassword.length === 0) || (newPassword === undefined || newPassword.length === 0)) && (oldPassword !== undefined && oldPassword.length > 0)) {
            console.log('New password is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, newPassword: true, confirmNewPassword: true });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            console.log('Passwords do not match');
            setPasswordsDoNotMatch(true);
            return;
        }
        setInEditMode(false);
        const result = await users.edit(auth.id as string, email, oldPassword, newPassword, firstName, lastName)
        if (!result) {
            console.log('Failed to update user info');
            Alert.alert('Error', 'Failed to update profile.');
            return;
        }
        console.log('User info updated successfully');
        Alert.alert('Success', 'Profile updated successfully.');
    }

    const cancel = () => {
        setInEditMode(false);
        setMustSetOldPassword(false);
        setPasswordsDoNotMatch(false);
        setRequiredFieldEmpty({ firstName: false, lastName: false, email: false, newPassword: false, confirmNewPassword: false });
        fetchProfileInfo();
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchProfileInfo(controller);
        return () => {
            controller.abort();
        }
    }, []);

    return (
        <View style={styles.background}>
            <ScrollView>
                { /* Logout Popup */}
                <Popup animationType="none" transparent={true} visible={logoutPopupVisible} onRequestClose={() => closePopup('logout')}>
                    <View style={{ width: 300 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Poppins', color: color.getColors().textColor }}>Are you sure you want to log out?</Text>
                        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                            <Button variant="secondary" text="Yes" onPress={logout} style={{ width: 75 }} />
                            <Button variant="secondary" text="No" onPress={() => closePopup('logout')} style={{ width: 75 }} />
                        </View>
                    </View>
                </Popup>

                { /* Delete Account Popup */}
                <Popup animationType="none" transparent={true} visible={deleteAccountPopupVisible} onRequestClose={() => closePopup('delete')}>
                    <View style={{ width: 300 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Poppins', color: color.getColors().textColor }}>Are you sure you want to delete your account?</Text>
                        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                            <Button variant="secondary" text="Yes" onPress={deleteAccount} style={{ width: 75 }} />
                            <Button variant="secondary" text="No" onPress={() => closePopup('delete')} style={{ width: 75 }} />
                        </View>
                    </View>
                </Popup>

                { /* Page Content */}
                <View style={styles.topView}>
                    { /* Account Info */}
                    <Text style={styles.header}>Account Info</Text>
                    {
                        inEditMode ?
                            <>
                                <View style={styles.container}>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Email</Text>
                                            <View style={styles.inputContainer}>
                                                <InputField
                                                    variant="secondary"
                                                    onChangeText={email => setEmail(email)}
                                                    placeholder="Email"
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    value={email}
                                                    style={styles.input}
                                                />
                                                <Text style={styles.requiredField}>{requiredFieldEmpty.email ? 'This field is required.' : ''}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Password</Text>
                                            <View style={{ ...styles.inputContainer }}>
                                                <View style={{ width: '100%' }}>
                                                    <InputField
                                                        variant="secondary"
                                                        onChangeText={oldPassword => setOldPassword(oldPassword)}
                                                        placeholder="Old Password"
                                                        secureTextEntry
                                                        value={oldPassword}
                                                        eyeColor={color.theme === 'light' ? '#000' : '#fff'}
                                                        style={{ ...styles.input, marginBottom: 0 }}
                                                    />
                                                    <Text style={{ ...styles.requiredField, minWidth: 175, marginBottom: 10 }}>{mustSetOldPassword ? 'This field is required.' : ''}</Text>
                                                </View>
                                                <View style={{ width: '100%' }}>
                                                    <InputField
                                                        variant="secondary"
                                                        onChangeText={newPassword => setNewPassword(newPassword)}
                                                        placeholder="New Password"
                                                        secureTextEntry
                                                        value={newPassword}
                                                        eyeColor={color.theme === 'light' ? '#000' : '#fff'}
                                                        style={{ ...styles.input, marginBottom: 0 }}
                                                    />
                                                    <Text style={{ ...styles.requiredField, minWidth: 175, marginBottom: 10 }}>{requiredFieldEmpty.newPassword ? 'This field is required.' : passwordsDoNotMatch ? 'Passwords do not match.' : ''}</Text>
                                                </View>
                                                <View style={{ width: '100%' }}>
                                                    <InputField
                                                        variant="secondary"
                                                        onChangeText={confirmNewPassword => setConfirmNewPassword(confirmNewPassword)}
                                                        placeholder="Confirm New Password"
                                                        secureTextEntry
                                                        value={confirmNewPassword}
                                                        eyeColor={color.theme === 'light' ? '#000' : '#fff'}
                                                        style={{ ...styles.input, marginBottom: -0 }}
                                                    />
                                                    <Text style={{ ...styles.requiredField, minWidth: 175, marginBottom: 0 }}>{requiredFieldEmpty.confirmNewPassword ? 'This field is required.' : passwordsDoNotMatch ? 'Passwords do not match.' : ''}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>First Name</Text>
                                            <View style={styles.inputContainer}>
                                                <InputField
                                                    variant="secondary"
                                                    onChangeText={firstName => setFirstName(firstName)}
                                                    placeholder="First Name"
                                                    autoCapitalize="words"
                                                    value={firstName}
                                                    style={styles.input}
                                                />
                                                <Text style={styles.requiredField}>{requiredFieldEmpty.firstName ? 'This field is required.' : ''}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Last Name</Text>
                                            <View style={styles.inputContainer}>
                                                <InputField
                                                    variant="secondary"
                                                    onChangeText={lastName => setLastName(lastName)}
                                                    placeholder="Last Name"
                                                    autoCapitalize="words"
                                                    value={lastName}
                                                    style={styles.input}
                                                />
                                                <Text style={styles.requiredField}>{requiredFieldEmpty.lastName ? 'This field is required.' : ''}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, marginBottom: 40, gap: 10 }}>
                                    <Button variant="secondary" text="Submit" style={{ width: '100' }} onPress={handleSubmit} />
                                    <Button variant="danger" text="Cancel" style={{ width: '100' }} onPress={cancel} />
                                </View>
                            </>
                            :
                            <>
                                <View style={styles.container}>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Email</Text>
                                            <Text style={styles.entryText} numberOfLines={1} ellipsizeMode="tail">{email}</Text>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Password</Text>
                                            <Text style={styles.entryText}>**********</Text>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>First Name</Text>
                                            <Text style={styles.entryText} numberOfLines={1} ellipsizeMode="tail">{firstName}</Text>
                                        </View>
                                    </View>
                                    <View style={{ ...styles.entryItem }}>
                                        <View style={styles.entryContainer}>
                                            <Text style={styles.entryText}>Last Name</Text>
                                            <Text style={styles.entryText} numberOfLines={1} ellipsizeMode="tail">{lastName}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 10, width: 125, alignSelf: 'flex-end' }}>
                                    <Button variant="secondary" text="Edit Profile" onPress={openEditMode} />
                                </View>
                            </>
                    }

                    { /* Account Actions */}
                    <Text style={{ ...styles.header }}>Account Actions</Text>
                    <Text style={{ ...styles.description, marginTop: 20 }}>Logging out of your account will unregister this device as a logged-in device.</Text>
                    <View style={styles.container}>
                        <View style={{ ...styles.entryItem }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Log Out of Account</Text>
                                <Button style={{ padding: 10, width: 100 }} variant="danger" text="Log Out" onPress={() => openPopup('logout')} />
                            </View>

                        </View>
                    </View>
                    <Text style={{ ...styles.description, marginTop: 40, color: color.getColors().textDanger }}>Deleting your account will permanently remove all data associated with it.</Text>
                    <View style={{ ...styles.container, borderColor: color.getColors().borderDanger }}>
                        <View style={{ ...styles.entryItem }}>
                            <View style={styles.entryContainer}>
                                <Text style={{ ...styles.entryText, color: color.getColors().textDanger }}>Delete Your Account</Text>
                                <Button style={{ padding: 10, width: 100 }} variant="danger" text="Delete" onPress={() => openPopup('delete')} />
                            </View>

                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
        background: {
            backgroundColor: color.backgroundColor,
            width: '100%',
            height: '100%',
        },
        topView: {
            display: 'flex',
            width: '85%',
            alignSelf: 'center',
        },
        container: {
            marginTop: 10,
            marginBottom: 20,
            backgroundColor: color.foregroundColor,
            borderWidth: 0.5,
            borderColor: color.borderColor,
            borderRadius: 10,
            width: '100%'
        },
        header: {
            fontSize: 16,
            fontFamily: 'Poppins-Light',
            alignSelf: 'flex-start',
            marginTop: 20,
            marginLeft: 5,
            color: color.textColor,
        },
        description: {
            marginTop: 10,
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
            marginLeft: 5,
            width: '95%'
        },
        entryItem: {
            borderBottomColor: color.borderColor,
            flexDirection: 'row',
        },
        entryContainer: {
            width: '100%',
            height: '100%',
            padding: 20,
            borderColor: color.borderColor,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
        },
        entryText: {
            color: color.textColor,
            fontFamily: 'Poppins',
            fontSize: 16,
            maxWidth: '50%',
            alignSelf: 'center'
        },
        inputContainer: {
            //backgroundColor: 'black'
            width: '50%',
            minWidth: 200
        },
        requiredField: {
            color: color.textDanger,
            marginTop: 15,
            fontFamily: 'Poppins-Light',
            alignSelf: 'flex-start'
        },
        input: {
            marginBottom: -15,
            height: 30
        },
    });
}