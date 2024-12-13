import Button from '@/components/Button';
import Popup from '@/components/Popup';
import { useAPI } from '@/context/APIContext';
import { useAuth } from '@/context/AuthContext';
import { ColorTypes, useColor } from '@/context/ColorContext';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { UserProps } from './_layout';

export default function ProfileScreen({ email, firstName, lastName }: UserProps) {
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
    const [deleteAccountPopupVisible, setDeleteAccountPopupVisible] = useState(false);
    const color = useColor();
    const styles = getStyles(color.getColors());
    const auth = useAuth();
    const api = useAPI();

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

    const logout = async (result: boolean) => {
        closePopup('logout');
        if (result) {
            const body = { refreshToken: auth.refreshToken };
            const result = await api.request('users/logout', 'POST', body, true);
            if (result.status !== 204) {
                console.log('Failed to log out: ' + result.data.error);
                return;
            }
            console.log('Logout successful');
            await auth.logout();
        }
    }

    const deleteAccount = async (result: boolean) => {
        closePopup('delete');
        if (result) {
            const result = await api.request(`users/delete/${auth.id}`, 'DELETE', null, true);
            if (result.status !== 204) {
                console.log('Failed to delete account: ' + result.data.error);
                return;
            }
            console.log('Account deletion successful');
            await auth.logout();
        }
    }

    return (
        <View style={styles.background}>
            <ScrollView>
                { /* Logout Popup */}
                <Popup animationType="none" transparent={true} visible={logoutPopupVisible} onRequestClose={() => closePopup('logout')}>
                    <View style={{ width: 300 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Poppins', color: color.getColors().text }}>Are you sure you want to log out?</Text>
                        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 40, marginTop: 20 }}>
                            <Button variant="secondary" text="Yes" onPress={() => logout(true)} style={{ width: 75 }} />
                            <Button variant="secondary" text="No" onPress={() => logout(false)} style={{ width: 75 }} />
                        </View>
                    </View>
                </Popup>

                { /* Delete Account Popup */}
                <Popup animationType="none" transparent={true} visible={deleteAccountPopupVisible} onRequestClose={() => closePopup('delete')}>
                    <View style={{ width: 300 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Poppins', color: color.getColors().text }}>Are you sure you want to delete your account?</Text>
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
            backgroundColor: color.background,
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
            backgroundColor: color.foreground,
            borderWidth: 0.5,
            borderColor: color.border,
            borderRadius: 10,
            width: '100%'
        },
        header: {
            fontSize: 16,
            fontFamily: 'Poppins-Light',
            alignSelf: 'flex-start',
            marginTop: 20,
            marginLeft: 5,
            color: color.text,
        },
        description: {
            marginTop: 10,
            color: color.text,
            fontFamily: 'Poppins-Regular',
            marginLeft: 5,
            width: '95%'
        },
        entryItem: {
            borderColor: color.border,
            width: '100%',
            flexDirection: 'row',
        },
        entryContainer: {
            width: '100%',
            height: '100%',
            padding: 20,
            borderColor: color.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
        },
        entryTextContainer: {
            flexDirection: 'row',
            gap: 10,
        },
        entryText: {
            color: color.text,
            fontFamily: 'Poppins',
            fontSize: 16,
            maxWidth: '80%',
            alignSelf: 'center'
        },
    });
}