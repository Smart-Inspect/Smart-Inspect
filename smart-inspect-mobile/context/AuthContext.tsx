import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

interface AuthContextType {
    isAuthenticated: boolean;
    id: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    isVerified: boolean;
    login: (id: string, accessToken: string, refreshToken: string, isAccountVerified: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [id, setId] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRefreshToken() {
            const id = await AsyncStorage.getItem('id');
            const isVerified = await AsyncStorage.getItem('isVerified');
            const accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (id && refreshToken) {
                setId(id);
                setAccessToken(accessToken ? accessToken : null);
                setRefreshToken(refreshToken);
                setIsAuthenticated(true);
                console.log('[AUTH] User is authenticated');
            } else {
                console.log('[AUTH] User is not authenticated');
                setIsAuthenticated(false);
            }

            if (isVerified) {
                setIsVerified(isVerified === 'true');
                console.log('[AUTH] User is verified');
            } else {
                console.log('[AUTH] User is not verified');
                setIsVerified(false);
            }
        }
        fetchRefreshToken();
    }, []);

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: string) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                await AsyncStorage.removeItem('accessToken');
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            appStateSubscription.remove();
        };
    }, []);

    const login = async (id: string, accessToken: string, refreshToken: string, isAccountVerified: boolean): Promise<void> => {
        setIsAuthenticated(true);
        await AsyncStorage.setItem('id', id);
        setId(id);
        await AsyncStorage.setItem('isVerified', isAccountVerified.toString());
        setIsVerified(isAccountVerified);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        setRefreshToken(refreshToken);
        await AsyncStorage.setItem('accessToken', accessToken);
        setAccessToken(accessToken);
    }

    const logout = async (): Promise<void> => {
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('id');
        setId(null);
        await AsyncStorage.removeItem('isVerified');
        setIsVerified(false);
        await SecureStore.deleteItemAsync('refreshToken');
        setRefreshToken(null);
        await AsyncStorage.removeItem('accessToken');
        setAccessToken(null);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, id, isVerified, accessToken, refreshToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
