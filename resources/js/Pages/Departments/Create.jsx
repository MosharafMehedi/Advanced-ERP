import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiSave, FiX, FiArrowLeft, FiGrid } from 'react-icons/fi';

export default function Create({ branches, users }) {
    const { data, setData, post, processing, errors } = useForm({
        department_code: '',
        name: '',
        branch_id: '',
        dept_head_id: '',
        status: '1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('departments.store'));
    };

    // Shared field styles — rectangular, formal, matching the rest of the module.
    const inputStyle = "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
    const labelStyle = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2";
    const errorStyle = "text-red-600 dark:text-red-400 text-xs mt-1 font-medium";

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Department Management</h2>}
        >
            <Head title="Create Department" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-3xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiGrid className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Departments &nbsp;›&nbsp; Create
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Create New Department
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={route('departments.index')}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" />
                            Back to List
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                            {/* Section header */}
                            <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
                                <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                    Department Information
                                </h3>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelStyle}>Department Code *</label>
                                    <input
                                        type="text"
                                        value={data.department_code}
                                        onChange={e => setData('department_code', e.target.value)}
                                        className={`${inputStyle} font-mono`}
                                        placeholder="e.g., IT-DHK"
                                    />
                                    {errors.department_code && <div className={errorStyle}>{errors.department_code}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Department Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={inputStyle}
                                        placeholder="e.g., Information Technology"
                                    />
                                    {errors.name && <div className={errorStyle}>{errors.name}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Assign Branch</label>
                                    <select
                                        value={data.branch_id}
                                        onChange={e => setData('branch_id', e.target.value)}
                                        className={`${inputStyle} cursor-pointer`}
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    {errors.branch_id && <div className={errorStyle}>{errors.branch_id}</div>}
                                </div>

                                <div>
                                    <label className={labelStyle}>Department Head</label>
                                    <select
                                        value={data.dept_head_id}
                                        onChange={e => setData('dept_head_id', e.target.value)}
                                        className={`${inputStyle} cursor-pointer`}
                                    >
                                        <option value="">Select Head of Department</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    {errors.dept_head_id && <div className={errorStyle}>{errors.dept_head_id}</div>}
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

                            {/* Actions */}
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end gap-2">
                                <Link
                                    href={route('departments.index')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FiX className="h-4 w-4" /> Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="h-4 w-4" /> {processing ? 'Saving...' : 'Save Department'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
