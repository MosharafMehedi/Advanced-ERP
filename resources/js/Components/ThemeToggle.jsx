import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    // Shared inline window state controller context tracking layout
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    const toggleTheme = () => {
        const root = window.document.documentElement;
        
        if (theme === 'dark') {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
            localStorage.setItem('theme', 'light');
            setTheme('light');
        } else {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        }
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95 z-50 relative"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? (
                // Sun Icon for Light Mode Activation
                <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ) : (
                // Moon Icon for Dark Mode Activation
                <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}