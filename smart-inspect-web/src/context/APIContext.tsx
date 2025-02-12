import { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { ENV } from '../utils/env';

class Response {
    status: number = 0;
    data: any;

    constructor(status: number, data: any) {
        this.status = status;
        this.data = data;
    }
}

interface APIContextType {
    loading: boolean;
    request: (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean, abort?: AbortController, dynamicData?: boolean) => Promise<Response>;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const request = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean, abort?: AbortController, dynamicData?: boolean): Promise<Response> => {
        return requestInternal(url, method, body, isAuthorized, auth.accessToken as string, abort, dynamicData);
    }

    const requestInternal = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body: any | undefined, isAuthorized: boolean, accessToken: string, abort?: AbortController, dynamicData?: boolean): Promise<Response> => {
        const signal = abort?.signal;
        // TODO: Come back and fix the loading spinner
        //setLoading(true);
        try {
            let headers: HeadersInit | undefined;
            let finalBody: BodyInit | null | undefined
            if (dynamicData) {
                headers = {
                    Authorization: isAuthorized ? `Bearer ${accessToken}` : ""
                }
                finalBody = body ? body : undefined;
            } else {
                headers = {
                    Authorization: isAuthorized ? `Bearer ${accessToken}` : "",
                    "Content-Type": "application/json"
                }
                finalBody = body ? JSON.stringify(body) : undefined;
            }

            const response = await fetch(`${ENV.API_URL}/api/${url}`, {
                method,
                headers,
                body: finalBody,
                signal
            });

            const data = response.status !== 204 ? dynamicData ? await response.blob() : await response.json() : null;
            const returnVal = new Response(response.status, data);

            // Handle unauthorized by getting new access token
            if (isAuthorized && (returnVal.status === 401 && returnVal.data.error === 'Invalid token')) {
                console.log('[API] Unauthorized, refreshing token');
                const newAccessToken = await refreshToken(signal);
                if (newAccessToken) {
                    return await requestInternal(url, method, body, isAuthorized, newAccessToken);
                } else {
                    await auth.logout();
                    navigate('/landing');
                }
            }

            setLoading(false);

            if (isAuthorized && (returnVal.status === 403 && returnVal.data.error === 'Account not verified')) {
                console.log('[API] Account not verified');
                navigate('/verify');
            }

            // Handle permission denied by logging out and redirecting to invalid permission page
            if (isAuthorized && (returnVal.status === 403 && returnVal.data.error === 'Permission denied')) {
                console.log('[API] Permission denied');
                // Send logout request to invalidate refresh token
                const body = {};
                const result = await request('users/logout', 'POST', body, true, abort);
                if (result.status === 204) {
                    console.log('[API] Sent log out request');
                } else if (result.status > 0) {
                    console.log('[API] Failed to send log out request: ' + result.data.error);
                }
                await auth.logout();
                navigate('/invalid-permission');
            }
            return returnVal;
        } catch (error) {
            setLoading(false);
            if (signal?.aborted) {
                console.log('[API] Request aborted');
                return new Response(0, { error: 'Request aborted' });
            }

            console.error('[API] Error:', error);
            await auth.logout();
            navigate('/landing');
            return new Response(503, { error: 'Service unavailable' });
        }
    }

    const refreshToken = async (signal?: AbortSignal): Promise<string | null> => {
        const response = await fetch(`${ENV.API_URL}/api/auth/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // Empty body because refresh token is in the cookie (DIFFERENT ON MOBILE APP)
            signal
        });

        // Refresh token is no longer valid
        if (response.status === 401) {
            console.log('[API] Refresh token is no longer valid');
            return null;
        }

        // Get new access token
        const data = await response.json();
        await auth.login(data.id, data.accessToken, data.userAccountVerified);

        return data.accessToken;
    }

    return (
        <APIContext.Provider value={{ loading, request }}>
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