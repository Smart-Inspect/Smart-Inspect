import Button from '@/components/Button';
import Popup from '@/components/Popup';
import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';

export interface ProfileScreenProps {
    email: string;
    firstName: string;
    lastName: string;
    permissions: number[];
}

export default function ProfileScreen({ email, firstName, lastName, permissions }: ProfileScreenProps) {
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
    const [deleteAccountPopupVisible, setDeleteAccountPopupVisible] = useState(false);

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

    const logout = (result: boolean) => {
        closePopup('logout');
        if (result) {
            // Logout logic here
        }
    }

    const deleteAccount = (result: boolean) => {
        closePopup('delete');
        if (result) {
            // Delete account logic here
        }
    }

    return (
        <ScrollView>
            { /* Logout Popup */}
            <Popup animationType="none" transparent={true} visible={logoutPopupVisible} onRequestClose={() => closePopup('logout')}>
                <View style={{ width: 300 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Poppins' }}>Are you sure you want to log out?</Text>
                    <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                        <Button variant="secondary" text="Yes" onPress={() => logout(true)} style={{ width: 75 }} />
                        <Button variant="secondary" text="No" onPress={() => logout(false)} style={{ width: 75 }} />
                    </View>
                </View>
            </Popup>

            { /* Delete Account Popup */}
            <Popup animationType="none" transparent={true} visible={deleteAccountPopupVisible} onRequestClose={() => closePopup('delete')}>
                <View style={{ width: 300 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Poppins' }}>Are you sure you want to delete your account?</Text>
                    <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                        <Button variant="secondary" text="Yes" onPress={() => deleteAccount(true)} style={{ width: 75 }} />
                        <Button variant="secondary" text="No" onPress={() => deleteAccount(false)} style={{ width: 75 }} />
                    </View>
                </View>
            </Popup>

            { /* Page Content */}
            <View style={styles.topView}>
                { /* Account Info */}
                <Text style={styles.header}>Account Info</Text>
                <View style={styles.container}>
                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                        <View style={{ ...styles.entryContainer }}>
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
                            <Text style={styles.entryText}>{firstName}</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.entryItem }}>
                        <View style={styles.entryContainer}>
                            <Text style={styles.entryText}>Last Name</Text>
                            <Text style={styles.entryText}>{lastName}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 10, width: 125, alignSelf: 'flex-end' }}>
                    <Button variant="secondary" text="Edit Profile" onPress={() => { }} />
                </View>

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
                <Text style={{ ...styles.description, marginTop: 40, color: '#911111' }}>Deleting your account will permanently remove all data associated with it.</Text>
                <View style={{ ...styles.container, borderColor: '#911111' }}>
                    <View style={{ ...styles.entryItem }}>
                        <View style={styles.entryContainer}>
                            <Text style={{ ...styles.entryText, color: '#911111' }}>Delete Your Account</Text>
                            <Button style={{ padding: 10, width: 100 }} variant="danger" text="Delete" onPress={() => openPopup('delete')} />
                        </View>

                    </View>
                </View>

            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    topView: {
        display: 'flex',
        width: '85%',
        alignSelf: 'center',
    },
    container: {
        marginTop: 10,
        backgroundColor: '#fff',
        borderWidth: 0.25,
        borderColor: '#053331',
        borderRadius: 10,
        width: '100%'
    },
    header: {
        fontSize: 16,
        fontFamily: 'Poppins-Light',
        alignSelf: 'flex-start',
        marginTop: 20,
        marginLeft: 5,
        color: '#053331'
    },
    description: {
        marginTop: 10,
        color: '#053331',
        fontFamily: 'Poppins-Regular',
        marginLeft: 5,
        width: '95%'
    },
    entryItem: {
        borderColor: '#053331',
        width: '100%',
        flexDirection: 'row',
    },
    entryContainer: {
        width: '100%',
        height: '100%',
        padding: 20,
        borderColor: '#053331',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    entryTextContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    entryText: {
        color: '#053331',
        fontFamily: 'Poppins',
        fontSize: 16,
        maxWidth: '80%',
        alignSelf: 'center'
    },
});