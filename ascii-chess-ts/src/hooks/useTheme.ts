import { useState, useEffect } from 'react';
import type { BootstrapTheme } from '../components/ThemeSelector';

export const useTheme = (initialTheme: BootstrapTheme = 'solar') => {
    const [theme, setTheme] = useState<BootstrapTheme>(() => {
        const savedTheme = localStorage.getItem('chess-theme');
        return (savedTheme as BootstrapTheme) || initialTheme;
    });

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const previousThemeLink = document.getElementById('bootstrap-theme');
                if (previousThemeLink) {
                    previousThemeLink.remove();
                }

                const link = document.createElement('link');
                link.id = 'bootstrap-theme';
                link.rel = 'stylesheet';
                link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${theme}/bootstrap.min.css`;
                document.head.appendChild(link);
                
                localStorage.setItem('chess-theme', theme);
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, [theme]);

    return { theme, setTheme };
};


