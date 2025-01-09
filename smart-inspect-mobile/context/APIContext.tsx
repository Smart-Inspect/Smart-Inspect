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

    const request = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean, contentType: string = 'application/json'): Promise<Response> => {
        return requestInternal(url, method, body, isAuthorized, auth.accessToken as string, contentType);
    }

    const requestInternal = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean, accessToken: string, contentType: string): Promise<Response> => {
        const response = await fetch(`${ENV.API_URL}/api/${url}`, {
            method,
            headers: {
                Authorization: isAuthorized ? `Bearer ${accessToken}` : "",
                "Content-Type": contentType,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = response.status !== 204 ? await response.json() : null;
        const returnVal = new Response(response.status, data);

        // Handle unauthorized by getting new access token
        if (isAuthorized && returnVal.status === 401) {
            console.log('[API] Unauthorized, refreshing token');
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                return await requestInternal(url, method, body, isAuthorized, newAccessToken, contentType);
            } else {
                navigation.navigate("landing" as never);
            }
        }

        return returnVal;
    }

    const refreshToken = async (): Promise<string | null> => {
        const response = await fetch(`${ENV.API_URL}/api/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
        });

        // Refresh token is no longer valid
        if (response.status === 401) {
            console.log('[API] Refresh token is no longer valid, logging out');
            await auth.logout();
            return null;
        }

        // Get new access token
        const data = await response.json();
        if (auth.refreshToken) {
            await auth.login(auth.id as string, data.accessToken, auth.refreshToken as string, auth.isVerified);
        } else {
            throw new Error("No refresh token and/or id found");
        }

        return data.accessToken;
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