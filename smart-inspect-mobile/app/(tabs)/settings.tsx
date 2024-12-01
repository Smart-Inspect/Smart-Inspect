import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
    const [theme, setTheme] = useState('system');

    const changeTheme = async (theme: string) => {
        setTheme(theme);
        await AsyncStorage.setItem('@theme', theme);
        // Reload theme from color context
    }

    return (
        <ScrollView>
            <View style={styles.topView}>

                { /* Theme */}
                <Text style={styles.header}>Theme</Text>
                <View style={styles.container}>
                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                        <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('system')}>
                            <View style={styles.entryTextContainer}>
                                <Icon name="auto-mode" size={25} />
                                <Text style={styles.entryText}>System</Text>
                            </View>
                            <Icon name={theme === 'system' ? 'radio-button-on' : 'radio-button-off'} size={25} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                        <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('light')}>
                            <View style={styles.entryTextContainer}>
                                <Icon name="light-mode" size={25} />
                                <Text style={styles.entryText}>Light</Text>
                            </View>
                            <Icon name={theme === 'light' ? 'radio-button-on' : 'radio-button-off'} size={25} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ ...styles.entryItem }}>
                        <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('dark')}>
                            <View style={styles.entryTextContainer}>
                                <Icon name="dark-mode" size={25} />
                                <Text style={styles.entryText}>Dark</Text>
                            </View>
                            <Icon name={theme === 'dark' ? 'radio-button-on' : 'radio-button-off'} size={25} />
                        </TouchableOpacity>
                    </View>
                </View>

                { /* App Info */}
                <Text style={styles.header}>App Info</Text>
                <View style={styles.container}>
                    <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                        <View style={styles.entryContainer}>
                            <Text style={styles.entryText}>Client Version</Text>
                            <Text style={styles.entryText}>1.0.0</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.entryItem }}>
                        <View style={styles.entryContainer}>
                            <Text style={styles.entryText}>Login Date</Text>
                            <Text style={styles.entryText}>2021-07-01 12:00:00</Text>
                        </View>
                    </View>
                </View>

            </View>
        </ScrollView>
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
    },
});
