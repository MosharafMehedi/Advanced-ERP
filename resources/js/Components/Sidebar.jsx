import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
// এখানে উদাহরণ হিসেবে কিছু Lucide এবং FontAwesome আইকন ইম্পোর্ট করা হয়েছে
import { FiGrid, FiFileText, FiSettings, FiX } from 'react-icons/fi'; 

export default function Sidebar({ showingSidebar, setShowingSidebar }) {
    
    const menuItems = [
        {
            name: 'Dashboard',
            route: 'dashboard',
            icon: FiGrid,
        },
        // {
        //     name: 'Employee Management',
        //     route: 'employees.index',
        //     icon: FiFileText,
        // },
        // {
        //     name: 'System Settings',
        //     route: 'settings.edit',
        //     icon: FiSettings,
        // }
        
    ];

    return (
        <>
            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 start-0 z-50 w-64 transform border-e border-slate-200/80 bg-white p-4 transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900
                lg:translate-x-0 lg:static lg:inset-0
                ${showingSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="flex h-16 items-center justify-between px-2 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-indigo-600 dark:text-indigo-400" />
                        <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">CoreERP</span>
                    </Link>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setShowingSidebar(false)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Dynamic Sidebar Menus */}
                <nav className="space-y-1 px-1">
                    {menuItems.map((item, index) => {
                        const isActive = route().current(item.route) || route().current(item.route + '.*');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={index}
                                href={route(item.route)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                <Icon className={`
                                    h-5 w-5 shrink-0 transition-colors duration-200
                                    ${isActive 
                                        ? 'text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                                    }
                                `} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Backdrop Overlay */}
            {showingSidebar && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setShowingSidebar(false)}
                />
            )}
        </>
    );
}