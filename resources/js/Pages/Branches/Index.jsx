import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState } from 'react';

export default function Index({ branches, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('branches.index'), { search, status }, { preserveState: true });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this branch!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('branches.destroy', id), {
                    onSuccess: () => Swal.fire({
                        title: 'Deleted!',
                        text: 'Branch deleted successfully.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
                    }),
                    onError: (errors) => {
                        if(errors.error) {
                            Swal.fire({
                                title: 'Failed!',
                                text: errors.error,
                                icon: 'error',
                                confirmButtonColor: '#4f46e5',
                                background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                                color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
                            });
                        }
                    }
                });
            }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            1: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20',
            0: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
            2: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
        };
        const labels = { 1: 'Active', 0: 'Inactive', 2: 'Suspended' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Branches Management</h2>}>
            <Head title="Branches" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
                
                {/* User-এর মতো ফিল্টার এবং অ্যাকশন বাটন ডিজাইন */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search code or name..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-300"
                            />
                        </div>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)}
                            className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-400"
                        >
                            <option value="">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Suspended</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-[#394e5a] hover:bg-[#2c3d47] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                            Filter
                        </button>
                    </form>

                    <Link href={route('branches.create')} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                        <FiPlus /> Add Branch
                    </Link>
                </div>

                {/* ক্লিন এবং রেসপনসিভ ইউজার স্ট্যান্ডার্ড টেবিল */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-4 font-semibold">Branch Code</th>
                                <th className="p-4 font-semibold">Branch Name</th>
                                <th className="p-4 font-semibold">Phone</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-300">
                            {branches.data.length > 0 ? branches.data.map((branch) => (
                                <tr key={branch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{branch.branch_code}</td>
                                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{branch.name}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{branch.phone || '—'}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{branch.email || '—'}</td>
                                    <td className="p-4">{getStatusBadge(branch.status)}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-1.5">
                                            <Link 
                                                href={route('branches.edit', branch.id)} 
                                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <FiEdit className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(branch.id)} 
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
                                    <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        No branches found.
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