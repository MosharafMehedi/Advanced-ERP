import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiChevronLeft, FiEdit2, FiMail, FiPhone, FiBriefcase, FiMapPin, FiShield, FiCalendar, FiUser } from 'react-icons/fi';

export default function Show({ user }) {
    // নামের প্রথম অক্ষর বের করার ফাংশন (Avatar এর জন্য)
    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('users.index')}
                        className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-2xs"
                    >
                        <FiChevronLeft className="h-4 w-4" />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        User Profile Details
                    </h2>
                </div>
            }
        >
            <Head title={`Profile - ${user.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Avatar & Core Identity */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-extrabold border border-indigo-100 dark:border-indigo-900/30 shadow-xs mb-4">
                        {getInitials(user.name)}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        ID: {user.employee_id || 'N/A'}
                    </p>

                    <div className="mt-4">
                        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase tracking-wider border border-emerald-200/40 dark:border-emerald-800/30">
                            {user.role || 'User'}
                        </span>
                    </div>

                    <hr className="w-full my-6 border-slate-100 dark:border-slate-800" />

                    {/* Quick Meta Info */}
                    <div className="w-full space-y-3.5 text-left text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                            <FiShield className="text-indigo-500 h-4 w-4 shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">System Authority</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1">{user.role || 'Standard Access'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiCalendar className="text-indigo-500 h-4 w-4 shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">Profile Created</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Action */}
                    <Link
                        href={route('users.edit', user.id)}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-2xs"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modify Information
                    </Link>
                </div>

                {/* Right Column: Detailed Information Blocks */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Block 1: Professional Placement */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <FiBriefcase className="text-indigo-500 h-4 w-4" /> Organization & HR Mapping
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Official Designation</span>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold text-[15px] block mt-1">{user.designation || 'N/A'}</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Department Assignment</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[15px] block mt-1">{user.department || 'N/A'}</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 sm:col-span-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attached Branch Location</span>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-[15px] mt-1">
                                    <FiMapPin className="text-rose-500 h-4 w-4" />
                                    <span>{user.branch || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Communication Points */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <FiUser className="text-indigo-500 h-4 w-4" /> Contact Communication
                        </h4>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 gap-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">{user.email}</span>
                                </div>
                                <a 
                                    href={`mailto:${user.email}`}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 rounded-lg transition-colors self-start sm:self-center"
                                >
                                    <FiMail className="h-3.5 w-3.5" /> Send Mail
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 gap-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mobile Connectivity</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">{user.phone || 'N/A'}</span>
                                </div>
                                {user.phone && (
                                    <a 
                                        href={`tel:${user.phone}`}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors self-start sm:self-center"
                                    >
                                        <FiPhone className="h-3.5 w-3.5" /> Call Now
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}