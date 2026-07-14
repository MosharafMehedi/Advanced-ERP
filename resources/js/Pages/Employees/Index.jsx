import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiBriefcase } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState } from 'react';

export default function Index({ employees, filters, branches, departments }) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [deptId, setDeptId] = useState(filters.department_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('employees.index'), { search, branch_id: branchId, department_id: deptId, status }, { preserveState: true });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this employee profile!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('employees.destroy', id), {
                    onSuccess: () => Swal.fire({
                        title: 'Deleted!',
                        text: 'Employee soft-deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
                    })
                });
            }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            1: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50',
            0: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200',
            2: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50',
            3: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50'
        };
        const labels = { 1: 'Active', 0: 'Inactive', 2: 'Resigned', 3: 'Terminated' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Employee Profiles</h2>}>
            <Head title="Employees" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
                
                {/* Advanced Search & Filter */}
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Name, ID, Email, Phone..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <select 
                        value={branchId} 
                        onChange={e => setBranchId(e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:ring-1 focus:ring-indigo-500 dark:text-slate-400"
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select 
                        value={deptId} 
                        onChange={e => setDeptId(e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:ring-1 focus:ring-indigo-500 dark:text-slate-400"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:ring-1 focus:ring-indigo-500 dark:text-slate-400"
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                        <option value="2">Resigned</option>
                        <option value="3">Terminated</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2 bg-[#394e5a] hover:bg-[#2c3d47] text-white rounded-xl text-sm font-semibold transition-colors">
                            Filter
                        </button>
                        <Link href={route('employees.create')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                            <FiPlus /> Add
                        </Link>
                    </div>
                </form>

                {/* Table Data */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-4">Employee Info</th>
                                <th className="p-4">Official Specs</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-300">
                            {employees.data.length > 0 ? employees.data.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {emp.profile_photo ? (
                                                <img src={`/storage/${emp.profile_photo}`} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <FiUser className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-950 dark:text-slate-100">{emp.full_name}</div>
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">{emp.employee_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-slate-800 dark:text-slate-300">{emp.designation?.title || 'No Designation'}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <FiBriefcase className="w-3 h-3" />
                                                {emp.department?.name || '—'} | {emp.branch?.name || '—'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-0.5">
                                            <div className="text-slate-800 dark:text-slate-300">{emp.email || '—'}</div>
                                            <div className="text-xs text-slate-500 font-semibold">{emp.phone || '—'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(emp.status)}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-1">
                                            <Link 
                                                href={route('employees.edit', emp.id)} 
                                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                                title="Edit Profile"
                                            >
                                                <FiEdit className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(emp.id)} 
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        No employee profiles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}