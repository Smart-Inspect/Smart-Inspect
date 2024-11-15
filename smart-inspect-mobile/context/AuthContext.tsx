import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (tokens: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
}

/*const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    login: () => { },
    logout: () => { },
});*/

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRefreshToken() {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
                setRefreshToken(refreshToken);
                setIsAuthenticated(true);
            }
        }
        fetchRefreshToken();
    }, []);

    async function login(tokens: { accessToken: string; refreshToken: string }) {
        setAccessToken(tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
        setIsAuthenticated(true);
    }

    async function logout() {
        setAccessToken(null);
        await SecureStore.deleteItemAsync('refreshToken');
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, refreshToken, login, logout }}>
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
