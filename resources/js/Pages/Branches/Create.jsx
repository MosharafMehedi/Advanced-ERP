import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiSave, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        branch_code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        status: '1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('branches.store'), {
            onSuccess: () => {
                // 💡 সফলভাবে তৈরি হলে SweetAlert পপআপ দেখাবে
                Swal.fire({
                    title: 'Success!',
                    text: 'Branch created successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
                });
                reset(); // ফর্মের ডেটা ক্লিয়ার করার জন্য
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to create branch. Please fix the validation errors.',
                    icon: 'error',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Create New Branch</h2>}>
            <Head title="Create Branch" />

            <form onSubmit={handleSubmit} className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 dark:text-slate-200">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Branch Code *</label>
                        <input 
                            type="text" 
                            value={data.branch_code} 
                            // 💡 .toUpperCase() দিয়ে স্টেট লেভেলেও ডাটা বড় হাতের অক্ষরে রূপান্তর নিশ্চিত করা হলো
                            onChange={e => setData('branch_code', e.target.value.toUpperCase())} 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl uppercase" 
                            placeholder="e.g., BR-DHK-MAIN" 
                        />
                        {errors.branch_code && <div className="text-rose-500 text-xs mt-1">{errors.branch_code}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Branch Name *</label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" 
                            placeholder="e.g., Dhaka Main Branch" 
                        />
                        {errors.name && <div className="text-rose-500 text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Phone Number</label>
                        <input 
                            type="text" 
                            value={data.phone} 
                            onChange={e => setData('phone', e.target.value)} 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" 
                            placeholder="e.g., +8802XXXXXXX" 
                        />
                        {errors.phone && <div className="text-rose-500 text-xs mt-1">{errors.phone}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" 
                            placeholder="e.g., dhaka.main@bank.com" 
                        />
                        {errors.email && <div className="text-rose-500 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Branch Physical Address</label>
                        <textarea 
                            value={data.address} 
                            onChange={e => setData('address', e.target.value)} 
                            rows="3" 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none" 
                            placeholder="Enter branch address..." 
                        />
                        {errors.address && <div className="text-rose-500 text-xs mt-1">{errors.address}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Status</label>
                        <select 
                            value={data.status} 
                            onChange={e => setData('status', e.target.value)} 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Link href={route('branches.index')} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"><FiX /> Cancel</Link>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"><FiSave /> Save Branch</button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}