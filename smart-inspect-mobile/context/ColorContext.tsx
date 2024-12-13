import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface ColorTypes {
    background: string,
    foreground: string,
    text: string,
    textDanger: string,
    placeholderText: string,
    border: string,
    borderDanger: string,
    shadow: string,
    header: string,
    headerTintColor: string,
    tabBar: string,
    tabBarActiveTint: string,
    tabBarInactiveTint: string,
    icon: string,
    buttonSecondary: string,
    buttonDanger: string,
}

const colors = {
    light: {
        background: '#f0f0f0',
        foreground: '#ffffff',
        text: '#053331',
        textDanger: '#911111',
        placeholderText: '#aaa',
        border: '#053331',
        borderDanger: '#911111',
        shadow: 'rgba(0, 0, 0, 0.5)',
        header: '#ffffff',
        headerTintColor: '#053331',
        tabBar: '#ffffff',
        tabBarActiveTint: '#053331',
        tabBarInactiveTint: '#aaa',
        icon: '#053331',
        buttonSecondary: 'rgba(5, 51, 49, 0.45)',
        buttonDanger: 'rgba(145, 17, 17, 0.45)',
    },
    dark: {
        background: '#010a19',
        foreground: '#131821',
        text: '#f0f6fc',
        textDanger: '#c93636',
        placeholderText: '#999',
        border: '#f0f6fc',
        borderDanger: '#c93636',
        shadow: 'rgba(0, 0, 0, 0.5)',
        header: '#131821',
        headerTintColor: '#f0f6fc',
        tabBar: '#131821',
        tabBarActiveTint: '#f0f6fc',
        tabBarInactiveTint: '#999',
        icon: '#f0f6fc',
        buttonSecondary: 'rgba(240, 246, 252, 0.45)',
        buttonDanger: 'rgba(201, 54, 54, 0.45)',
    }
}

interface ColorContextType {
    theme: 'system' | 'light' | 'dark';
    changeTheme: (theme: 'system' | 'light' | 'dark') => void;
    getColors: () => ColorTypes;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
    const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>('light');
    const scheme = useColorScheme();

    useEffect(() => {
        reloadTheme();
    }, [scheme]);

    const changeTheme = async (theme: 'system' | 'light' | 'dark') => {
        await AsyncStorage.setItem('@theme', theme);
        reloadTheme();
        console.log('[COLOR] Theme changed to', theme);
    }

    const reloadTheme = async () => {
        const theme = await AsyncStorage.getItem('@theme');
        if (theme) {
            setTheme(theme as 'system' | 'light' | 'dark');
        }

        if (!theme || theme === 'system') {
            if (scheme === 'dark') {
                setAppliedTheme('dark');
            } else if (scheme === 'light') {
                setAppliedTheme('light');
            }
        } else {
            setAppliedTheme(theme as 'light' | 'dark');
        }
    }

    const getColors = (): ColorTypes => {
        if (appliedTheme === 'light') {
            return colors.light;
        } else {
            return colors.dark;
        }
    }

    return (
        <ColorContext.Provider value={{ theme, changeTheme, getColors }}>
            {children}
        </ColorContext.Provider>
    );
}

export const useColor = () => {
    const context = useContext(ColorContext);
    if (context === undefined) {
        throw new Error('useColor must be used within an APIProvider');
    }
    return context;
}