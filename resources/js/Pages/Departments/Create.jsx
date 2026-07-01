import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiSave, FiX, FiLayers } from 'react-icons/fi';

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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Create New Department</h2>}>
            <Head title="Create Department" />

            <form onSubmit={handleSubmit} className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Department Code *</label>
                        <input type="text" value={data.department_code} onChange={e => setData('department_code', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" placeholder="e.g., IT-DHK" />
                        {errors.department_code && <div className="text-rose-500 text-xs mt-1">{errors.department_code}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Department Name *</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" placeholder="e.g., Information Technology" />
                        {errors.name && <div className="text-rose-500 text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Assign Branch</label>
                        <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <option value="">Select Branch</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        {errors.branch_id && <div className="text-rose-500 text-xs mt-1">{errors.branch_id}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Department Head</label>
                        <select value={data.dept_head_id} onChange={e => setData('dept_head_id', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <option value="">Select Head of Department</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        {errors.dept_head_id && <div className="text-rose-500 text-xs mt-1">{errors.dept_head_id}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Status</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Link href={route('departments.index')} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"><FiX /> Cancel</Link>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"><FiSave /> Save Department</button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}