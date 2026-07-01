import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiBriefcase, FiMapPin, FiShield, FiCalendar, FiUser } from 'react-icons/fi';

// Same role-chip tokens used on the Users master list, for visual consistency.
const ROLE = {
    admin: 'bg-red-50 text-red-700 border-l-4 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500',
    manager: 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500',
    default: 'bg-slate-100 text-slate-600 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500',
};

function roleChip(role) {
    const r = (role || '').toLowerCase();
    if (r.includes('admin')) return ROLE.admin;
    if (r.includes('manager') || r.includes('hr')) return ROLE.manager;
    return ROLE.default;
}

export default function Show({ user }) {
    const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>}
        >
            <Head title={`Profile - ${user.name}`} />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-6xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiUser className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Users &nbsp;›&nbsp; Profile
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    User Profile Details
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={route('users.index')}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" />
                            Back to List
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Left Column: Identity Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm p-6 flex flex-col items-center text-center h-fit">
                            <div className="h-20 w-20 rounded-sm bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-2xl font-bold border border-blue-200 dark:border-blue-500/20 mb-4">
                                {getInitials(user.name)}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                                {user.employee_id || 'N/A'}
                            </p>

                            <div className="mt-4">
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${roleChip(user.role)}`}>
                                    {user.role || 'User'}
                                </span>
                            </div>

                            <hr className="w-full my-5 border-slate-200 dark:border-slate-800" />

                            {/* Quick Meta Info */}
                            <div className="w-full space-y-4 text-left text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shrink-0">
                                        <FiShield className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">
                                            System Authority
                                        </p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 text-[13px]">
                                            {user.role || 'Standard Access'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shrink-0">
                                        <FiCalendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">
                                            Profile Created
                                        </p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 text-[13px]">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Action */}
                            <Link
                                href={route('users.edit', user.id)}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                            >
                                <FiEdit2 className="h-4 w-4" />
                                Modify Information
                            </Link>
                        </div>

                        {/* Right Column: Detailed Information Blocks */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Block 1: Professional Placement */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                                <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 flex items-center gap-2">
                                    <FiBriefcase className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                        Organization & HR Mapping
                                    </h4>
                                </div>

                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                                            Official Designation
                                        </span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold text-[14px] block mt-1">
                                            {user.designation || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                                            Department Assignment
                                        </span>
                                        <span className="text-blue-700 dark:text-blue-400 font-bold text-[14px] block mt-1">
                                            {user.department || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800 sm:col-span-2">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                                            Attached Branch Location
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-[14px] mt-1">
                                            <FiMapPin className="h-3.5 w-3.5 text-slate-400" />
                                            <span>{user.branch || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Block 2: Communication Points */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                                <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 flex items-center gap-2">
                                    <FiUser className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                        Contact Communication
                                    </h4>
                                </div>

                                <div className="p-5 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800 gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                                                Email Address
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block text-[13px]">
                                                {user.email}
                                            </span>
                                        </div>
                                        <a
                                            href={`mailto:${user.email}`}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors self-start sm:self-center"
                                        >
                                            <FiMail className="h-3.5 w-3.5" /> Send Mail
                                        </a>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800 gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                                                Mobile Connectivity
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block text-[13px]">
                                                {user.phone || 'N/A'}
                                            </span>
                                        </div>
                                        {user.phone && (
                                            <a
                                                href={`tel:${user.phone}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors self-start sm:self-center"
                                            >
                                                <FiPhone className="h-3.5 w-3.5" /> Call Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
