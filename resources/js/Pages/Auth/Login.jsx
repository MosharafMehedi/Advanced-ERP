import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ThemeToggle from '@/Components/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { FiShield } from 'react-icons/fi';

import { Head, useForm, usePage } from '@inertiajs/react';
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

    const fireAlert = (options) => {
        const isDark = document.documentElement.classList.contains('dark');
        return Swal.fire({
            ...options,
            background: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
            confirmButtonColor: '#1d4ed8',
            cancelButtonColor: '#64748b',
            customClass: {
                popup: 'rounded-sm border border-slate-300 dark:border-slate-700 shadow-xl font-sans',
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
        <div
            className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 font-sans antialiased selection:bg-blue-700 selection:text-white relative overflow-hidden transition-colors duration-300"
            style={{
                backgroundImage:
                    'radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
            }}
        >
            <Head title="ERP Login" />

            {/* Theme toggle */}
            <div className="absolute top-5 right-5 z-50">
                <ThemeToggle />
            </div>

            {/* Soft depth glow behind the card — subtle, blue-tinted, non-distracting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-blue-700/[0.05] dark:bg-blue-500/[0.04] blur-[90px] pointer-events-none rounded-full"></div>

            {/* Fade the dot-grid out near the edges so it reads as texture, not noise */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,theme(colors.slate.100)_78%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,theme(colors.slate.950)_78%)]"></div>

            {/* --- Main Content Layout --- */}
            <div className="w-full max-w-[420px] relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center mb-3">
                        {globalSettings?.logo_url ? (
                            <img
                                src={globalSettings.logo_url}
                                alt={globalSettings?.app_name || 'Logo'}
                                className="block h-8 w-auto md:h-9 object-contain"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white">
                                <ApplicationLogo className="h-6 w-6 fill-current text-white" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                        Welcome to {globalSettings?.app_name || 'My Application'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                        Please sign in to access your dashboard workstation.
                    </p>
                </div>

                {/* --- Login Card --- */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-xl shadow-slate-300/30 dark:shadow-none overflow-hidden transition-all duration-300">
                    {/* Signature top accent — same corporate identity marker as the rest of the ERP */}
                    <div className="h-1 w-full bg-blue-700"></div>

                    <form onSubmit={submit} className="p-7 sm:p-8 space-y-5">
                        {/* Email Address Input */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors duration-300"
                            />
                            <div className="mt-1.5 relative">
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
                                    className="block w-full pl-10 py-2.5 text-sm rounded-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:ring focus:ring-blue-600/10 transition-all duration-200"
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
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors duration-300"
                            />
                            <div className="mt-1.5 relative">
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
                                    className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:ring focus:ring-blue-600/10 transition-all duration-200"
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
                                    className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-700 focus:ring-blue-600/20 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                                />
                                <span className="ms-2.5 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors font-medium">
                                    Keep me logged in
                                </span>
                            </label>
                        </div>

                        {/* Submit Execution */}
                        <div className="pt-1">
                            <PrimaryButton
                                className="w-full h-11 inline-flex items-center justify-center rounded-sm bg-blue-700 hover:bg-blue-800 active:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 text-sm tracking-wide normal-case"
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
                                    'Sign In'
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                            <FiShield className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                            Enterprise Secured Environment
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-600">
                            © {new Date().getFullYear()} {globalSettings?.app_name || 'ERP System'}. All rights reserved.
                        </p>
                    </div>
            </div>
        </div>
    );
}
