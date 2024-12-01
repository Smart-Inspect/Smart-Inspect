import React from 'react';
import { Tabs } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useAPI } from '@/context/APIContext';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import ProfileScreen, { ProfileScreenProps } from './profile';

export default function TabLayout() {
    const { isAuthenticated, id } = useAuth();
    const navigation = useNavigation();
    const api = useAPI();

    const [profile, setProfile] = useState<ProfileScreenProps | null>(null);

    const testAPI = async () => {
        try {
            const response = await api.request('', 'GET', null, false);
            console.log(response.status + ' ' + response.data);
        } catch (error) {
            console.error('Error fetching server status:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await api.request(`/users/view/${id}`, 'GET', null, true);
            setProfile(response.data as ProfileScreenProps);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to landing page');
            navigation.navigate('landing' as never);
        }
    }, []);

    useEffect(() => {
        testAPI();
        //fetchProfile();
    }, []);

    return (
        <Tabs screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                if (route.name === 'index') {
                    return <MIcon name='home' size={size} color={color} />;
                } else if (route.name === 'profile') {
                    return <FAIcon name='user' size={size} color={color} />;
                } else if (route.name === 'settings') {
                    return <MIcon name='settings' size={size} color={color} />;
                }
            },
            tabBarActiveTintColor: '#053331',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: { backgroundColor: '#fff' },
        })}>
            <Tabs.Screen name="index" options={{ title: 'Home', headerShown: true }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: true }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        </Tabs>
    )
}
