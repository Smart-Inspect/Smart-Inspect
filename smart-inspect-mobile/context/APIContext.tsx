import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNavigation } from 'expo-router';
import { ENV } from '@/utils/env';

class Response {
    status: number = 0;
    data: any;

    constructor(status: number, data: any) {
        this.status = status;
        this.data = data;
    }
}

interface APIContextType {
    request: (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean) => Promise<Response>;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const navigation = useNavigation();

    const request = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean): Promise<Response> => {
        const response = await fetch(`${ENV.API_URL}/api/${url}`, {
            method,
            headers: {
                Authorization: isAuthorized ? `Bearer ${auth.accessToken}` : "",
                "Content-Type": "application/json",
            },
            body,
        });

        const returnVal = new Response(response.status, await response.json());

        // Handle unauthorized by getting new access token
        if (isAuthorized && returnVal.status === 401) {
            const result = await refreshToken();
            if (result) {
                return await request(url, method, body, isAuthorized);
            } else {
                navigation.navigate("landing" as never);
            }
        }

        return returnVal;
    }

    const refreshToken = async (): Promise<boolean> => {
        const response = await fetch(`${ENV.API_URL}/api/refresh`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${auth.refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        // Refresh token is no longer valid
        if (response.status == 401) {
            auth.logout();
            return false;
        }

        // Get new access token
        const data = await response.json();
        if (auth.refreshToken) {
            auth.login({ id: auth.id as string, accessToken: data.accessToken, refreshToken: auth.refreshToken as string });
        } else {
            throw new Error("No refresh token and/or id found");
        }

        return true;
    }

    return (
        <APIContext.Provider value={{ request }}>
            {children}
        </APIContext.Provider>
    );
}

export const useAPI = () => {
    const context = useContext(APIContext);
    if (context === undefined) {
        throw new Error('useAPI must be used within an APIProvider');
    }
    return context;
}