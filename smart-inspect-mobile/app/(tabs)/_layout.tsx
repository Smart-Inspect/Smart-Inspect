import React from 'react';
import { useEffect } from 'react';
import { useAPI } from '@/context/APIContext';
import { useColor } from '@/context/ColorContext';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function ProtectedLayout() {
    const api = useAPI();
    const color = useColor();

    // Check if user is authenticated and verified and has proper permissions (engineer)
    useEffect(() => {
        const controller = new AbortController();
        const authCheck = async () => {
            const response = await api.request('auth', 'GET', undefined, true, controller);
            if (response.status === 200) {
                console.log('Authenticated and Verified: ' + response.data.message);
            } else if (response.status === 401) {
                console.log('Not Authenticated and/or Verified');
            }
        }
        const permissionCheck = async (role: string) => {
            const response = await api.request(`auth/permission/${role}`, 'GET', undefined, true, controller);
            if (response.status === 200) {
                console.log('Engineer: ' + response.data.message);
            } else if (response.status === 403) {
                console.log('Not an Engineer');
            }
        }
        authCheck();
        permissionCheck('engineer');

        return () => {
            controller.abort();
        }
    }, [api]);

    return (
        <Tabs screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                if (route.name === '(home)') {
                    return <MIcon name='home' size={size} color={color} />;
                } else if (route.name === 'profile') {
                    return <FAIcon name='user' size={size} color={color} />;
                } else if (route.name === 'settings') {
                    return <MIcon name='settings' size={size} color={color} />;
                }
            },
            tabBarActiveTintColor: color.getColors().tabbarActiveTintColor,
            tabBarInactiveTintColor: color.getColors().tabbarInactiveTintColor,
            tabBarStyle: { backgroundColor: color.getColors().tabbarColor },
            headerStyle: { backgroundColor: color.getColors().headerColor },
            headerTintColor: color.getColors().headerTintColor,
        })}>
            <Tabs.Screen name="(home)" options={{ title: 'Home', headerShown: false }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: true }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        </Tabs>
    )
}