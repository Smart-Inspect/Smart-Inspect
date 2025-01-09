import { createContext, useContext, ReactNode, useState } from 'react';
import { useAPI } from './APIContext';
import { useAuth } from './AuthContext';

interface INotification {
    isVisible: boolean;
    variant: 'success' | 'error' | 'warning';
    message: string;
}

interface RequestsContextType {
    notification: INotification | undefined;
    users: {
        create: (email: string, password: string, firstName: string, lastName: string) => Promise<any | null>,
        login: (email: string, password: string) => Promise<boolean>,
        logout: () => Promise<boolean>,
        forgotPassword: (email: string) => Promise<boolean>,
        resetPassword: (token: string, newPassword: string) => Promise<boolean>,
        sendVerificationEmail: (abort?: AbortController) => Promise<'success' | 'fail' | 'abort'>,
        checkVerification: () => Promise<boolean>,
        acceptVerification: (token: string, abort: AbortController) => Promise<'success' | 'fail' | 'abort'>,
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        viewAll: (abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        edit: (id: string, email: string, oldPassword: string | undefined, newPassword: string | undefined, firstName: string, lastName: string, permissionLevel: string) => Promise<boolean>,
        delete: (id: string) => Promise<boolean>,
    }
    buildings: {
        create: (name: string, address: string) => Promise<any | null>,
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        viewAll: (abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        viewUnits: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        edit: (id: string, name: string, address: string, addressHistory: string[] | undefined) => Promise<boolean>,
        delete: (id: string) => Promise<boolean>,
    }
    projects: {
        create: (name: string, description: string, buildingId: string, engineerToUnits: { engineerId: string; unitNumbers: string[] }[]) => Promise<any | null>,
        view: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        edit: (id: string, name: string, description: string, unitNumbers: string[], engineerIds: string[], status: 'started' | 'completed' | 'not-started', engineerToUnits: { engineerId: string; unitNumbers: string[] }[]) => Promise<boolean>,
        viewAll: (abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        uploadLayouts: (id: string, data: FormData) => Promise<boolean>,
        viewLayouts: (id: string, abort?: AbortController) => Promise<any | 'fail' | 'abort'>,
        downloadLayout: (id: string, layoutId: string) => Promise<any | 'fail' | 'abort'>,
        delete: (id: string) => Promise<boolean>,
        deleteLayouts: (id: string, layoutIds: string[]) => Promise<boolean>,
    }
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider = ({ children }: { children: ReactNode }) => {
    const api = useAPI();
    const auth = useAuth();
    const [notification, setNotification] = useState<{ isVisible: boolean, variant: 'success' | 'error' | 'warning', message: string } | undefined>(undefined);

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
    }

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
                displayNotification('success', response.data.message);
                return response.data;
            } else {
                displayNotification('error', response.data.error);
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
                await auth.login(response.data.id, response.data.accessToken, response.data.isAccountVerified);
                return true;
            } else {
                return false;
            }
        },
        logout: async () => {
            const body = {};
            const response = await api.request('users/logout', 'POST', body, true);
            if (response.status === 200) {
                auth.logout();
                return true;
            } else {
                console.log('Logout failed: ' + response.data.error);
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
        resetPassword: async (token: string, newPassword: string) => {
            const body = {
                resetToken: token,
                newPassword
            };

            const response = await api.request('users/reset-password/email', 'POST', body, false);
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
                await auth.login(response.data.id, response.data.accessToken, response.data.isAccountVerified);
                return true;
            } else {
                return false;
            }
        },
        acceptVerification: async (token: string, abort: AbortController) => {
            const body = {
                verifyToken: token
            };

            const response = await api.request('users/verify/email', 'POST', body, false, abort);
            if (response.status === 200) {
                return 'success';
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
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
        edit: async (id: string, email: string, oldPassword: string | undefined, newPassword: string | undefined, firstName: string, lastName: string, permissionLevel: string) => {
            const body = {
                email,
                oldPassword,
                newPassword,
                firstName,
                lastName,
                permissionLevel
            }
            const response = await api.request(`users/edit/${id}`, 'PUT', body, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
        delete: async (id: string) => {
            const response = await api.request(`users/delete/${id}`, 'DELETE', null, true);
            if (response.status === 200) {
                if (id === auth.id) {
                    await auth.logout();
                } else {
                    displayNotification('success', response.data.message);
                }
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
    }

    const buildings = {
        create: async (name: string, address: string) => {
            const body = {
                name,
                address
            }

            const response = await api.request('buildings/create', 'POST', body, true);
            if (response.status === 201) {
                displayNotification('success', response.data.message);
                return response.data;
            } else {
                displayNotification('error', response.data.error);
                return null;
            }
        },
        view: async (id: string, abort?: AbortController) => {
            const response = await api.request(`buildings/view/${id}`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewUnits: async (id: string, abort?: AbortController) => {
            const response = await api.request(`buildings/view/${id}/units`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewAll: async (abort?: AbortController) => {
            const response = await api.request('buildings/view', 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        edit: async (id: string, name: string, address: string, addresses: string[] | undefined) => {
            const body = {
                name,
                address,
                addresses
            }
            console.log(body);
            const response = await api.request(`buildings/edit/${id}`, 'PUT', body, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
        delete: async (id: string) => {
            const response = await api.request(`users/delete/${id}`, 'DELETE', null, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        }
    }

    const projects = {
        create: async (name: string, description: string, buildingId: string, engineerToUnits: { engineerId: string; unitNumbers: string[] }[]) => {
            const engineerIds = engineerToUnits.map(e => e.engineerId);
            const unitNumbers = engineerToUnits.reduce((acc, curr) => acc.concat(curr.unitNumbers), [] as string[]);
            const body = {
                name,
                description,
                buildingId,
                unitNumbers,
                engineerIds,
                engineerToUnits
            }
            const response = await api.request('projects/create', 'POST', body, true);
            if (response.status === 201) {
                displayNotification('success', response.data.message);
                return response.data;
            } else {
                displayNotification('error', response.data.error);
                return null;
            }
        },
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
        edit: async (id: string, name: string, description: string, unitNumbers: string[], engineerIds: string[], status: 'started' | 'completed' | 'not-started', engineerToUnits: { engineerId: string; unitNumbers: string[] }[]) => {
            const body = {
                name,
                description,
                unitNumbers,
                engineerIds,
                status,
                engineerToUnits
            }
            const response = await api.request(`projects/edit/${id}`, 'PUT', body, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
        uploadLayouts: async (id: string, data: FormData) => {
            const response = await api.request(`projects/create/${id}/upload-layouts`, 'POST', data, true, undefined, true);
            if (response.status === 201) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
        viewAll: async (abort?: AbortController) => {
            const response = await api.request('projects/view', 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        viewLayouts: async (id: string, abort?: AbortController) => {
            const response = await api.request(`projects/view/${id}/layouts`, 'GET', null, true, abort);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        downloadLayout: async (id: string, layoutId: string) => {
            const response = await api.request(`projects/view/${id}/download-layout/${layoutId}`, 'GET', null, true);
            if (response.status === 200) {
                return response.data;
            } else if (response.status > 0) {
                return 'fail';
            } else {
                return 'abort';
            }
        },
        delete: async (id: string) => {
            const response = await api.request(`projects/delete/${id}`, 'DELETE', null, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        },
        deleteLayouts: async (id: string, layoutIds: string[]) => {
            const body = {
                layoutIds
            }
            const response = await api.request(`projects/delete/${id}/layouts`, 'DELETE', body, true);
            if (response.status === 200) {
                displayNotification('success', response.data.message);
                return true;
            } else {
                displayNotification('error', response.data.error);
                return false;
            }
        }
    }

    return (
        <RequestsContext.Provider value={{ notification, users, buildings, projects }}>
            {children}
        </RequestsContext.Provider>
    );
}

export const useRequests = () => {
    const context = useContext(RequestsContext);
    if (context === undefined) {
        throw new Error('useRequests must be used within a RequestsProvider');
    }
    return context;
}
