import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean;
    id: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    login: (tokens: { id: string, accessToken: string; refreshToken: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [id, setId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRefreshToken() {
            const id = await AsyncStorage.getItem('id');
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (id && refreshToken) {
                setId(id);
                setRefreshToken(refreshToken);
                setIsAuthenticated(true);
            }
        }
        fetchRefreshToken();
    }, []);

    const login = async (data: { id: string, accessToken: string; refreshToken: string }) => {
        await AsyncStorage.setItem('id', data.id);
        setId(data.id);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        setRefreshToken(data.refreshToken);
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
    }

    const logout = async () => {
        await AsyncStorage.removeItem('id');
        setId(null);
        await SecureStore.deleteItemAsync('refreshToken');
        setRefreshToken(null);
        setAccessToken(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, id, accessToken, refreshToken, login, logout }}>
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
