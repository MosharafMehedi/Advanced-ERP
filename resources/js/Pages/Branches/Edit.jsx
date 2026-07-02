import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiSave, FiX, FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

export default function Edit({ branch }) {
    const { data, setData, put, processing, errors } = useForm({
        id: branch.id,
        branch_code: branch.branch_code ?? '',
        name: branch.name ?? '',
        address: branch.address ?? '',
        phone: branch.phone ?? '',
        email: branch.email ?? '',
        status: branch.status ?? '1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('branches.update', branch.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Branch updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    ...swalTheme(),
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong. Please check the form.',
                    icon: 'error',
                    confirmButtonColor: '#1d4ed8',
                    ...swalTheme(),
                });
            }
        });
    };

    // Shared field styles — rectangular, formal, matching the rest of the module.
    const inputStyle = "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
    const labelStyle = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2";
    const errorStyle = "text-red-600 dark:text-red-400 text-xs mt-1 font-medium";

    const SectionHeader = ({ children }) => (
        <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {children}
            </h3>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Branch Management</h2>}
        >
            <Head title="Edit Branch" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-3xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiEdit2 className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Branches &nbsp;›&nbsp; Edit
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Edit Branch
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm px-3 py-2">
                                <span className="text-slate-400 dark:text-slate-500">Code</span>
                                <span className="text-slate-900 dark:text-white font-mono">{branch.branch_code || 'N/A'}</span>
                            </div>
                            <Link
                                href={route('branches.index')}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                            >
                                <FiArrowLeft className="h-3.5 w-3.5" />
                                Back to List
                            </Link>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                            {/* Section: Branch Information */}
                            <SectionHeader>Branch Information</SectionHeader>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className={labelStyle}>Branch Code *</label>
                                    <input
                                        type="text"
                                        value={data.branch_code}
                                        onChange={e => setData('branch_code', e.target.value)}
                                        className={`${inputStyle} font-mono uppercase`}
                                        placeholder="e.g., BR-DHK-MAIN"
                                    />
                                    {errors.branch_code && <div className={errorStyle}>{errors.branch_code}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Branch Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={inputStyle}
                                        placeholder="e.g., Dhaka Main Branch"
                                    />
                                    {errors.name && <div className={errorStyle}>{errors.name}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelStyle}>Status</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className={`${inputStyle} cursor-pointer md:max-w-xs`}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                        <option value="2">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section: Contact Details */}
                            <SectionHeader>Contact Details</SectionHeader>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelStyle}>Phone Number</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className={inputStyle}
                                        placeholder="e.g., +8802XXXXXXX"
                                    />
                                    {errors.phone && <div className={errorStyle}>{errors.phone}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className={inputStyle}
                                        placeholder="e.g., dhaka.main@bank.com"
                                    />
                                    {errors.email && <div className={errorStyle}>{errors.email}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelStyle}>Branch Physical Address</label>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="3"
                                        className={`${inputStyle} resize-none`}
                                        placeholder="Enter branch address..."
                                    />
                                    {errors.address && <div className={errorStyle}>{errors.address}</div>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end gap-2">
                                <Link
                                    href={route('branches.index')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FiX className="h-4 w-4" /> Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="h-4 w-4" /> {processing ? 'Saving...' : 'Update Branch'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
