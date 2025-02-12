import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    id: string | null;
    accessToken: string | null;
    isVerified: boolean;
    login: (id: string, accessToken: string, isVerified: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [id, setId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    const login = async (id: string, accessToken: string, isVerified: boolean): Promise<void> => {
        setIsAuthenticated(true);
        setId(id);
        setAccessToken(accessToken);
        setIsVerified(isVerified);
    }

    const logout = async (): Promise<void> => {
        setIsAuthenticated(false);
        setId(null);
        setAccessToken(null);
        setIsVerified(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, id, accessToken, isVerified, login, logout }}>
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
