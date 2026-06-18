import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Edit({ user, roles, departments, branches }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        employee_id: user.employee_id || '',
        department: user.department || '',
        branch: user.branch || '',
        role: user.role || '',
        designation: user.designation || '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Modify User Records</h2>}>
            <Head title="Edit User" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <Link href={route('users.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold">
                        <FiArrowLeft /> Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee ID */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Employee ID</label>
                            <input type="text" value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                            {errors.employee_id && <p className="text-xs text-rose-500 mt-1">{errors.employee_id}</p>}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                        </div>

                        {/* Department Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                            <select value={data.department} onChange={e => setData('department', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                                {departments.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
                            </select>
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Designation</label>
                            <input type="text" value={data.designation} onChange={e => setData('designation', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                        </div>

                        {/* Branch Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Branch</label>
                            <select value={data.branch} onChange={e => setData('branch', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                                {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                            </select>
                        </div>

                        {/* System Role */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">System Role</label>
                            <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                                {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password <span className="text-[10px] text-slate-400 lowercase">(leave blank to keep current)</span></label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Confirm Password</label>
                            <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href={route('users.index')} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
                            <FiSave /> Save Records
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}