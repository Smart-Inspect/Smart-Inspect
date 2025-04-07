import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface ColorTypes {
    backgroundColor: string,
    foregroundColor: string,
    textColor: string,
    textWarning: string,
    textDanger: string,
    textPlaceholder: string,
    borderColor: string,
    borderWarning: string,
    borderDanger: string,
    shadowColor: string,
    headerColor: string,
    headerTintColor: string,
    tabbarColor: string,
    tabbarActiveTintColor: string,
    tabbarInactiveTintColor: string,
    iconColor: string,
    buttonSecondary: string,
    buttonSecondaryHover: string,
    buttonWarning: string,
    buttonWarningHover: string,
    buttonDanger: string,
    buttonDangerHover: string
}

const colors = {
    light: {
        backgroundColor: "#f0f0f0",
        foregroundColor: "#ffffff",
        textColor: "#053331",
        textWarning: "#9a930e",
        textDanger: "#911111",
        textPlaceholder: '#aaa',
        borderColor: "#053331",
        borderWarning: "#cdc40f",
        borderDanger: "#911111",
        shadowColor: "rgba(5, 51, 49, 0.45)",
        headerColor: "#ffffff",
        headerTintColor: "#053331",
        tabbarColor: "#ffffff",
        tabbarActiveTintColor: "#053331",
        tabbarInactiveTintColor: "#666",
        iconColor: "#053331",
        buttonSecondary: "rgba(5, 51, 49, 0.45)",
        buttonSecondaryHover: "rgba(5, 51, 49, 0.65)",
        buttonWarning: "rgba(205, 196, 15, 0.45)",
        buttonWarningHover: "rgba(205, 196, 15, 0.65)",
        buttonDanger: "rgba(145, 17, 17, 0.45)",
        buttonDangerHover: "rgba(145, 17, 17, 0.65)"
    },
    dark: {
        backgroundColor: "#010a19",
        foregroundColor: "#131821",
        textColor: "#f0f6fc",
        textWarning: "#ffdb4f",
        textDanger: "#c93636",
        textPlaceholder: '#999',
        borderColor: "#f0f6fc",
        borderWarning: "#ffdb4f",
        borderDanger: "#c93636",
        shadowColor: "rgba(240, 246, 252, 0.45)",
        headerColor: "#131821",
        headerTintColor: "#f0f6fc",
        tabbarColor: "#131821",
        tabbarActiveTintColor: "#f0f6fc",
        tabbarInactiveTintColor: "#999",
        iconColor: "#f0f6fc",
        buttonSecondary: "rgba(240, 246, 252, 0.45)",
        buttonSecondaryHover: "rgba(240, 246, 252, 0.65)",
        buttonWarning: "rgba(255, 255, 0, 0.45)",
        buttonWarningHover: "rgba(255, 255, 0, 0.65)",
        buttonDanger: "rgba(201, 54, 54, 0.45)",
        buttonDangerHover: "rgba(201, 54, 54, 0.65)"
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
        throw new Error('useColor must be used within a ColorProvider');
    }
    return context;
}