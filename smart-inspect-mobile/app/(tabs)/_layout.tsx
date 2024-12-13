import React from 'react';
import { useNavigation } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useAPI } from '@/context/APIContext';
import { useColor } from '@/context/ColorContext';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import storage from '@/utils/storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './index';
import ProfileScreen from './profile';
import SettingsScreen from './settings';

export interface UserProps {
    email: string;
    firstName: string;
    lastName: string;
    permissions: number[];
    creationDate: string;
}

export default function TabLayout() {
    const { isAuthenticated, isVerified, id } = useAuth();
    //const navigation = useNavigation();
    const api = useAPI();
    const color = useColor();
    const Tabs = createBottomTabNavigator();

    const [profile, setProfile] = useState<UserProps | null>(null);

    const fetchProfile = async () => {
        try {
            const response = await api.request(`users/view/${id}`, 'GET', null, true);
            if (response.status !== 200) {
                console.log('Failed to fetch profile: ' + response.data.error);
                return;
            }
            setProfile(response.data as UserProps);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    useEffect(() => {
        console.log('Fetching data...');
        if (isAuthenticated && isVerified) {
            // Run any fetch functions here
            console.log('Fetching profile');
            fetchProfile();
        }
    }, [isAuthenticated, isVerified]);

    return (
        <Tabs.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                if (route.name === 'index') {
                    return <MIcon name='home' size={size} color={color} />;
                } else if (route.name === 'profile') {
                    return <FAIcon name='user' size={size} color={color} />;
                } else if (route.name === 'settings') {
                    return <MIcon name='settings' size={size} color={color} />;
                }
            },
            tabBarActiveTintColor: color.getColors().tabBarActiveTint,
            tabBarInactiveTintColor: color.getColors().tabBarInactiveTint,
            tabBarStyle: { backgroundColor: color.getColors().tabBar },
            headerStyle: { backgroundColor: color.getColors().header },
            headerTintColor: color.getColors().headerTintColor,
        })}>
            <Tabs.Screen name="index" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: true }}>
                {() => profile && <ProfileScreen {...profile} />}
            </Tabs.Screen>
            <Tabs.Screen name="settings" options={{ title: 'Settings', headerShown: true }}>
                {() => profile && <SettingsScreen {...profile} />}
            </Tabs.Screen>
        </Tabs.Navigator>
    )
}
