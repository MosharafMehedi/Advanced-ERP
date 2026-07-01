import { Link, usePage } from '@inertiajs/react'; 
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Header({ user, showingSidebar, setShowingSidebar }) {
    const { globalSettings } = usePage().props;
    
    return (
        <header className="h-16 border-b border-slate-200/80 bg-[#394e5a] dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300 sticky top-0 z-30">
            <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-8">

                {/* Left Side: Mobile Toggler + Logo + Project Name */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Mobile Menu Toggler */}
                    <button
                        onClick={() => setShowingSidebar(!showingSidebar)}
                        className="inline-flex items-center justify-center rounded-xl p-2 text-slate-300 transition duration-150 ease-in-out hover:bg-slate-700 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                    >
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo + Project Name */}
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5">
                        {globalSettings?.logo_url ? (
                        <img 
                            src={globalSettings.logo_url} 
                            alt={globalSettings?.app_name || "Logo"} 
                            className="block h-6 w-auto md:h-8 object-contain" 
                        />
                    ) : (
                        <ApplicationLogo className="block h-6 w-6 md:h-8 md:w-auto fill-current text-[#A7F3D0] dark:text-indigo-400" />
                    )}
                        
                        <span className="text-base md:text-lg font-bold tracking-tight text-white dark:text-white block">
                            {globalSettings?.app_name || 'My Application'}
                        </span>
                    </Link>
                </div>

                {/* Right Side: Action Controls */}
                <div className="flex items-center gap-2 sm:gap-3.5">

                    {/* Notification Button */}
                    <button className="relative rounded-xl p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all">
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-500 animate-pulse" />
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>

                    {/* Theme Toggler */}
                    <div className="scale-90 sm:scale-100 transition-transform">
                        <ThemeToggle />
                    </div>

                    <div className="h-4 sm:h-5 w-px bg-slate-600 dark:bg-slate-700 mx-0.5 sm:mx-1" />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-transparent bg-transparent py-1 sm:py-1.5 pe-1 sm:pe-2 ps-1 text-xs sm:text-sm font-semibold text-slate-200 transition duration-150 ease-in-out hover:text-white focus:outline-none dark:text-slate-300 dark:hover:text-slate-100"
                                    >
                                        {/* Avatar Initials */}
                                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-[10px] sm:text-xs font-bold text-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="hidden sm:inline">{user.name}</span>
                                        <svg className="-me-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600 dark:text-red-400">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}