import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ThemeToggle from '@/Components/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';

import { Head, useForm,usePage } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Login({ status }) {
    const { globalSettings } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Reusable utility function to handle theme-compliant SweetAlerts dynamically based on system config
    const fireAlert = (options) => {
        const isDark = document.documentElement.classList.contains('dark');
        return Swal.fire({
            ...options,
            background: isDark ? '#0f172a' : '#ffffff', // slate-900 / white
            color: isDark ? '#f8fafc' : '#0f172a',      // slate-50 / slate-900
            confirmButtonColor: '#4f46e5',               // indigo-600
            cancelButtonColor: '#64748b',                // slate-500
            customClass: {
                popup: 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl font-sans',
                title: 'font-bold text-xl',
                htmlContainer: 'text-sm'
            }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        
        post(route('login'), {
            onError: (err) => {
                fireAlert({
                    icon: 'error',
                    title: 'Authentication Failed',
                    text: err.email || err.password || 'Please check your credential tokens.',
                });
                reset('password');
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-sans antialiased selection:bg-indigo-600 selection:text-white relative overflow-hidden transition-colors duration-300">
            <Head title="ERP Login" />
            
            {/* Position absolute wrapper map context format layout to prevent dynamic styling break */}
            <div className="absolute top-5 right-5 z-50">
                <ThemeToggle />
            </div>

            {/* --- Easily Replaceable Background Watermark Image --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 scale-100 sm:scale-110 opacity-[0.04] dark:opacity-[0.02] transition-opacity duration-300">
                <img 
                    src="/loginPage/logo.png" 
                    alt="System Watermark" 
                    className="w-[550px] h-[550px] object-contain dark:invert"
                />
            </div>

            {/* Subtle Depth Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/[0.02] dark:bg-indigo-500/[0.02] blur-[80px] pointer-events-none rounded-full"></div>

            {/* --- Main Content Layout --- */}
            <div className="w-full max-w-[420px] relative z-10">
                
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-3">
                        {globalSettings?.logo_url ? (
                        <img 
                            src={globalSettings.logo_url} 
                            alt={globalSettings?.app_name || "Logo"} 
                            className="block h-6 w-auto md:h-8 object-contain" 
                        />
                    ) : (
                        <ApplicationLogo className="block h-6 w-6 md:h-8 md:w-auto fill-current text-[#A7F3D0] dark:text-indigo-400" />
                    )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                        Welcome to {globalSettings?.app_name || 'My Application'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                        Please sign in to access your dashboard workstation.
                    </p>
                </div>

                {/* --- Standard Card Form (Updated with High-End Layout) --- */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-slate-200/30 dark:shadow-none transition-all duration-300">
                    <form onSubmit={submit} className="space-y-5">
                        
                        {/* Email Address Input */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors duration-300" />
                            <div className="mt-1.5 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
                                    placeholder="name@company.com"
                                    autoComplete="username"
                                    isFocused={true}
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center">
                                <InputLabel htmlFor="password" value="Password" className="text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors duration-300" />
                            </div>
                            <div className="mt-1.5 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10 pr-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Session */}
                        <div className="flex items-center pt-1">
                            <label className="flex items-center cursor-pointer select-none group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                                />
                                <span className="ms-2.5 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors font-medium">
                                    Keep me logged in
                                </span>
                            </label>
                        </div>

                        {/* Submit Execution */}
                        <div className="pt-1">
                            <PrimaryButton 
                                className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all disabled:opacity-50 text-sm tracking-wide normal-case" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="text-center mt-6 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-600 uppercase flex items-center justify-center gap-1 transition-colors duration-300">
                    🛡️ Enterprise Secured Environment
                </div>
            </div>
        </div>
    );
}