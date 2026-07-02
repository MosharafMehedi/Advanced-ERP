import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    FiArrowLeft, FiSave, FiUser, FiMail, FiPhone,
    FiBriefcase, FiLayers, FiMapPin, FiShield, FiLock, FiUserPlus
} from 'react-icons/fi';
import Swal from 'sweetalert2';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

// কন্ট্রোলার থেকে designations না আসলে এই ডিফল্ট লিস্টটি কাজ করবে
const DEFAULT_DESIGNATIONS = [
    { id: 'Software Engineer', name: 'Software Engineer' },
    { id: 'Project Manager', name: 'Project Manager' },
    { id: 'HR Manager', name: 'HR Manager' },
    { id: 'Accountant', name: 'Accountant' }
];

export default function Create({ roles = [], departments = [], branches = [], designations = [] }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        phone: '',
        employee_id: '',
        department_id: '',
        branch_id: '',
        role_id: '',
        designation: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('users.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'User account created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#1d4ed8',
                    ...swalTheme(),
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Please fix the validation errors in the form.',
                    icon: 'error',
                    confirmButtonColor: '#1d4ed8',
                    ...swalTheme(),
                });
            }
        });
    };

    // Shared field styles
    const inputWrapperStyle = "relative mt-1.5";
    const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 pointer-events-none";
    const inputStyle = "block w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
    const labelStyle = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";
    const errorStyle = "text-red-600 dark:text-red-400 text-xs mt-1 font-medium";

    const SectionHeader = ({ children }) => (
        <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {children}
            </h3>
        </div>
    );

    // যদি কন্ট্রোলার থেকে designations অ্যারে আসে সেটা ব্যবহার হবে, না হলে ডিফল্ট অ্যারে দেখাবে
    const designationList = designations.length > 0 ? designations : DEFAULT_DESIGNATIONS;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>}
        >
            <Head title="Create User" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-5xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiUserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Users &nbsp;›&nbsp; Create
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Create New User
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

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                            {/* Section: Personal Information */}
                            <SectionHeader>Personal Information</SectionHeader>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className={labelStyle}>Name *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiUser className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    {errors.name && <div className={errorStyle}>{errors.name}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Email *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiMail className={iconStyle} />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={inputStyle}
                                            placeholder="example@domain.com"
                                            autoComplete="none"
                                            required
                                        />
                                    </div>
                                    {errors.email && <div className={errorStyle}>{errors.email}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Phone *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiPhone className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={inputStyle}
                                            placeholder="+880 1XXXXXXXXX"
                                            required
                                        />
                                    </div>
                                    {errors.phone && <div className={errorStyle}>{errors.phone}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Employee ID *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiBriefcase className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.employee_id}
                                            onChange={e => setData('employee_id', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. MS-102"
                                            required
                                        />
                                    </div>
                                    {errors.employee_id && <div className={errorStyle}>{errors.employee_id}</div>}
                                </div>
                            </div>

                            {/* Section: Organizational Assignment */}
                            <SectionHeader>Organizational Assignment</SectionHeader>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 dark:border-slate-800">
                                
                                {/* Designation Dropdown*/}
                                <div>
                                    <label className={labelStyle}>Designation *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLayers className={iconStyle} />
                                        <select
                                            value={data.designation}
                                            onChange={e => setData('designation', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required
                                        >
                                            <option value="">Select Designation</option>
                                            {designationList.map((desig) => (
                                                <option key={desig.id} value={desig.id}>{desig.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.designation && <div className={errorStyle}>{errors.designation}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Department *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLayers className={iconStyle} />
                                        <select
                                            value={data.department_id}
                                            onChange={e => setData('department_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.department_id && <div className={errorStyle}>{errors.department_id}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Branch *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiMapPin className={iconStyle} />
                                        <select
                                            value={data.branch_id}
                                            onChange={e => setData('branch_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.branch_id && <div className={errorStyle}>{errors.branch_id}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Role *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiShield className={iconStyle} />
                                        <select
                                            value={data.role_id}
                                            onChange={e => setData('role_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.role_id && <div className={errorStyle}>{errors.role_id}</div>}
                                </div>
                            </div>

                            {/* Section: Account Security */}
                            <SectionHeader>Account Security</SectionHeader>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelStyle}>Password *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLock className={iconStyle} />
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className={inputStyle}
                                            required
                                        />
                                    </div>
                                    {errors.password && <div className={errorStyle}>{errors.password}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Confirm Password *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLock className={iconStyle} />
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            className={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}