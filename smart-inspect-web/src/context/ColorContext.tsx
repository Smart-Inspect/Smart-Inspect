import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

interface ColorContextType {
    theme: 'system' | 'light' | 'dark';
    appliedTheme: 'light' | 'dark';
    changeTheme: (theme: 'system' | 'light' | 'dark') => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
    const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>('light');

    const changeTheme = async (theme: 'system' | 'light' | 'dark') => {
        localStorage.setItem('theme', theme);
        reloadTheme();
        console.log('[COLOR] Theme changed to', theme);
    }

    const reloadTheme = useCallback(async () => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme as 'system' | 'light' | 'dark');
        } else {
            setTheme('system');
        }

        // Get the user's system theme preference if theme is 'system'
        if (theme === 'system') {
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setAppliedTheme(prefersDarkMode ? 'dark' : 'light');
        } else {
            setAppliedTheme(theme);
        }
    }, [theme]);

    useEffect(() => {
        reloadTheme();
    }, [reloadTheme]);

    useEffect(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(appliedTheme);
    }, [appliedTheme]);

    return (
        <ColorContext.Provider value={{ theme, appliedTheme, changeTheme }}>
            {children}
        </ColorContext.Provider>
    );
};

export const useColor = () => {
    const context = useContext(ColorContext);
    if (context === undefined) {
        throw new Error('useColor must be used within a ColorProvider');
    }
    return context;
}