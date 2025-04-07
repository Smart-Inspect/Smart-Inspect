import { createContext, useContext, ReactNode, useState } from 'react';
import { useAPI } from './APIContext';
import { useAuth } from './AuthContext';
import * as SecureStore from 'expo-secure-store';
import { IMetric } from '@/utils/types';

interface RequestsContextType {
    users: {
        create: (email: string, password: string, firstName: string, lastName: string) => Promise<any | null>,
        login: (email: string, password: string) => Promise<boolean>,
        logout: () => Promise<boolean>,
        forgotPassword: (email: string) => Promise<boolean>,
        sendVerificationEmail: (abort?: AbortController) => Promise<'success' | 'fail' | 'abort'>,
        checkVerification: () => Promise<any | 'fail'>,
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        edit: (id: string, email: string, oldPassword: string | undefined, newPassword: string | undefined, firstName: string, lastName: string) => Promise<boolean>,
        delete: (id: string) => Promise<boolean>,
    }
    buildings: {
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
    }
    projects: {
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        viewAssigned: (abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        downloadLayout: (id: string, layoutId: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>
    }
    inspections: {
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        viewAssigned: (projectId: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        downloadLayout: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        downloadPhoto: (id: string, photoId: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        edit: (id: string, inspectionDate: Date, layoutId: string | undefined, metrics: IMetric[] | undefined, notes: string | undefined, status: 'completed' | 'started' | 'not-started' | undefined, abort?: AbortController) => Promise<boolean>,
        deletePhotos: (id: string, photoIds: string[]) => Promise<boolean>,
        uploadPhoto: (id: string, data: FormData) => Promise<boolean>
    },
    units: {
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
    }
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider = ({ children }: { children: ReactNode }) => {
    const api = useAPI();
    const auth = useAuth();
    /*const [notification, setNotification] = useState<{ isVisible: boolean, variant: 'success' | 'error' | 'warning', message: string } | undefined>(undefined);

    const displayNotification = (variant: 'success' | 'error' | 'warning', message: string) => {
        setNotification({
            isVisible: true,
            variant,
            message
        });
        setTimeout(() => {
            setNotification({
                isVisible: false,
                variant,
                message
            });
        }, 6000);
    }*/

    const users = {
        create: async (email: string, password: string, firstName: string, lastName: string) => {
            const body = {
                email,
                password,
                firstName,
                lastName,
            }

            const response = await api.request('users/create', 'POST', body, false);
            if (response.status === 201) {
                return response.data;
            } else {
                return null;
            }
        },
        login: async (email: string, password: string) => {
            const body = {
                email,
                password
            }
            const response = await api.request('users/login', 'POST', body, false);
            if (response.status === 200) {
                await auth.login(response.data.id, response.data.accessToken, response.data.refreshToken, response.data.isAccountVerified);
                return true;
            } else {
                return false;
            }
        },
        logout: async () => {
            const body = { refreshToken: auth.refreshToken ?? await SecureStore.getItemAsync('refreshToken') as string };
            const response = await api.request('users/logout', 'POST', body, true);
            if (response.status === 200) {
                auth.logout();
                return true;
            } else {
                return false;
            }
        },
        forgotPassword: async (email: string) => {
            const body = {
                email
            }
            const response = await api.request('users/forgot-password', 'POST', body, false);
            return response.status === 200;
        },
        sendVerificationEmail: async (abort?: AbortController) => {
            const response = await api.request('users/verify/send', 'GET', null, true, abort);
            if (response.status === 200) {
                return 'success';
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        checkVerification: async () => {
            const response = await api.request('users/verify', 'GET', null, true);
            if (response.status === 200) {
                await auth.login(auth.id as string, response.data.accessToken, auth.refreshToken as string, response.data.isAccountVerified);
                return response.data;
            } else {
                return 'fail';
            }
        },
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`users/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewAll: async (abort?: AbortController) => {
            const response = await api.request('users/view', 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        edit: async (id: string, email: string, oldPassword: string | undefined, newPassword: string | undefined, firstName: string, lastName: string) => {
            const body = {
                email,
                oldPassword,
                newPassword,
                firstName,
                lastName
            }
            const response = await api.request(`users/edit/${id}`, 'PUT', body, true);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        },
        delete: async (id: string) => {
            const response = await api.request(`users/delete/${id}`, 'DELETE', null, true);
            if (response.status === 200) {
                if (id === auth.id) {
                    await auth.logout();
                }
                return true;
            } else {
                return false;
            }
        },
    }

    const buildings = {
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`buildings/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        }
    }

    const projects = {
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`projects/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewAssigned: async (abort?: AbortController) => {
            const response = await api.request('projects/view-assigned', 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        downloadLayout: async (id: string, layoutId: string, abort?: AbortController) => {
            const response = await api.request(`projects/view/${id}/download-layout/${layoutId}`, 'GET', null, true, abort, true);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
    }

    const inspections = {
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`inspections/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewAssigned: async (projectId: string, abort?: AbortController) => {
            const response = await api.request(`inspections/view-assigned/${projectId}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        downloadLayout: async (id: string, abort?: AbortController) => {
            const response = await api.request(`inspections/view/${id}/download-layout`, 'GET', null, true, abort, true);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        downloadPhoto: async (id: string, photoId: string, abort?: AbortController) => {
            const response = await api.request(`inspections/view/${id}/download-photo/${photoId}`, 'GET', null, true, abort, true);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        edit: async (id: string, inspectionDate: Date | undefined, layoutId: string | undefined, metrics: IMetric[] | undefined, notes: string | undefined, status: 'completed' | 'started' | 'not-started' | undefined, abort?: AbortController) => {
            console.log('Metrics', metrics);
            const body = {
                inspectionDate,
                layoutId,
                metrics,
                notes,
                status
            }
            const response = await api.request(`inspections/edit/${id}`, 'PUT', body, true, abort);
            if (response.status === 200) {
                return true;
            } else {
                console.log('Failed to edit inspection: ', response.status, response);
                return false;
            }
        },
        deletePhotos: async (id: string, photoIds: string[]) => {
            const body = {
                photoIds
            }
            const response = await api.request(`inspections/delete/${id}/delete-layouts`, 'DELETE', body, true);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        },
        uploadPhoto: async (id: string, data: FormData) => {
            const response = await api.request(`inspections/create/${id}/upload-photo`, 'POST', data, true, undefined, true);
            if (response.status === 201) {
                return true;
            } else {
                console.log('Failed to upload photo: ', response.status, response);
                return false;
            }
        },
    }

    const units = {
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`units/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        }
    }

    return (
        <RequestsContext.Provider value={{ /*notification, */users, buildings, projects, inspections, units }
        }>
            {children}
        </RequestsContext.Provider >
    );
}

export const useRequests = () => {
    const context = useContext(RequestsContext);
    if (context === undefined) {
        throw new Error('useRequests must be used within a RequestsProvider');
    }
    return context;
}
