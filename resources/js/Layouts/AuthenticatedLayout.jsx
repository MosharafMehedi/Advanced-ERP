import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingSidebar, setShowingSidebar] = useState(false);
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebar_collapsed') === 'true'; }
        catch { return false; }
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
            setIsCollapsed(collapsed);
        };

        window.addEventListener('sidebar_toggle', handleStorageChange);
        return () => window.removeEventListener('sidebar_toggle', handleStorageChange);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col antialiased">

            {/* Header Parent with explicit matching height */}
            <div className="sticky top-0 z-30 h-16 flex-shrink-0">
                <Header
                    user={user}
                    showingSidebar={showingSidebar}
                    setShowingSidebar={setShowingSidebar}
                />
            </div>

            {/* Body Wrapper */}
            <div className="flex flex-1 relative items-stretch">

                {/* Sidebar Component */}
                <Sidebar
                    showingSidebar={showingSidebar}
                    setShowingSidebar={setShowingSidebar}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                    
                    {header && (
                        <div className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </div>
                    )}

                    <main className="flex-1 p-4 lg:p-8">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>
        </div>
    );
}