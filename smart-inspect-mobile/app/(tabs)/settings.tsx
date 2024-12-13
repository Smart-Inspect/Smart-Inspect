import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColor, ColorTypes } from '@/context/ColorContext';
import { UserProps } from './_layout';

export default function SettingsScreen({ creationDate }: UserProps) {
    const color = useColor();
    const styles = getStyles(color.getColors());
    const [loginTime, setLoginTime] = useState('');

    const changeTheme = async (theme: 'system' | 'light' | 'dark') => {
        color.changeTheme(theme);
    }

    useEffect(() => {
        const getLoginTime = async () => {
            const time = await AsyncStorage.getItem('loginTime');
            if (time) {
                setLoginTime(new Date(parseInt(time)).toLocaleString());
            }
        }
        getLoginTime();
    });

    return (
        <View style={styles.background}>
            <ScrollView>
                <View style={styles.topView}>

                    { /* Theme */}
                    <Text style={styles.header}>Theme</Text>
                    <View style={styles.container}>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('system')}>
                                <View style={styles.entryTextContainer}>
                                    <Icon name="auto-mode" size={25} color={color.getColors().icon} />
                                    <Text style={styles.entryText}>System</Text>
                                </View>
                                <Icon name={color.theme === 'system' ? 'radio-button-on' : 'radio-button-off'} size={25} color={color.getColors().icon} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('light')}>
                                <View style={styles.entryTextContainer}>
                                    <Icon name="light-mode" size={25} color={color.getColors().icon} />
                                    <Text style={styles.entryText}>Light</Text>
                                </View>
                                <Icon name={color.theme === 'light' ? 'radio-button-on' : 'radio-button-off'} size={25} color={color.getColors().icon} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ ...styles.entryItem }}>
                            <TouchableOpacity style={styles.entryContainer} onPress={() => changeTheme('dark')}>
                                <View style={styles.entryTextContainer}>
                                    <Icon name="dark-mode" size={25} color={color.getColors().icon} />
                                    <Text style={styles.entryText}>Dark</Text>
                                </View>
                                <Icon name={color.theme === 'dark' ? 'radio-button-on' : 'radio-button-off'} size={25} color={color.getColors().icon} />
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
                        <View style={{ ...styles.entryItem, borderBottomWidth: 0.25 }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Login Date</Text>
                                <Text style={styles.entryText}>{loginTime}</Text>
                            </View>
                        </View>
                        <View style={{ ...styles.entryItem }}>
                            <View style={styles.entryContainer}>
                                <Text style={styles.entryText}>Creation Date</Text>
                                <Text style={styles.entryText}>{new Date(parseInt(creationDate)).toLocaleString()}</Text>
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
        },
    });
}
