import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
//import { useNavigation } from '@react-navigation/native';
import { ENV } from "@/utils/env";
//import * as rootNavigation from "@/utils/rootNavigation";

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
    //const navigation = useNavigation();

    async function request(url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean): Promise<Response> {
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
                //rootNavigation.navigate("login" as never);
            }
        }

        return returnVal;
    }

    async function refreshToken(): Promise<boolean> {
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
            auth.login({ accessToken: data.accessToken, refreshToken: auth.refreshToken });
        } else {
            throw new Error("No refresh token found");
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
        throw new Error('useAPI must be used within an AuthProvider');
    }
    return context;
}