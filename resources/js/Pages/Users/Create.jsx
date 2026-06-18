import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Create({ roles, departments, branches }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '', email: '', phone: '', employee_id: '',
        department: '', branch: '', role: '', designation: '',
        password: '', password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    // কমন ইনপুট স্টাইল মডিউল (UI কনসিস্টেন্সি বজায় রাখার জন্য)
    const inputStyle = "w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10 shadow-sm transition-all duration-200";

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Create New User</h2>}>
            <Head title="Create User" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <Link href={route('users.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold transition-colors">
                        <FiArrowLeft /> Back to List
                    </Link>
                </div>

                {/* ব্রাউজার অটো-ফিল রুখতে autoComplete="off" দেওয়া হয়েছে */}
                <form onSubmit={handleSubmit} autoComplete="off" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                    
                    {/* ডাটাবেজ ইনপুট গ্রিড */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Employee ID */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Employee ID</label>
                            <input 
                                type="text" 
                                value={data.employee_id} 
                                onChange={e => setData('employee_id', e.target.value)} 
                                className={inputStyle}
                                placeholder="e.g. MYSOFT-102"
                            />
                            {errors.employee_id && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.employee_id}</p>}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Full Name</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className={inputStyle}
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.name}</p>}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)} 
                                className={inputStyle}
                                placeholder="name@domain.com"
                                autoComplete="none" // 👈 ব্রাউজারকে ফোর্স করা হয়েছে অটোফিল না করার জন্য
                            />
                            {errors.email && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.email}</p>}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Phone Number</label>
                            <input 
                                type="text" 
                                value={data.phone} 
                                onChange={e => setData('phone', e.target.value)} 
                                className={inputStyle}
                                placeholder="+880 1XXX XXXXXX"
                            />
                            {errors.phone && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.phone}</p>}
                        </div>

                        {/* Department Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Department</label>
                            <select 
                                value={data.department} 
                                onChange={e => setData('department', e.target.value)} 
                                className={`${inputStyle} cursor-pointer appearance-none`}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
                            </select>
                            {errors.department && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.department}</p>}
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Designation</label>
                            <input 
                                type="text" 
                                value={data.designation} 
                                onChange={e => setData('designation', e.target.value)} 
                                className={inputStyle}
                                placeholder="e.g. Senior Software Engineer"
                            />
                            {errors.designation && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.designation}</p>}
                        </div>

                        {/* Branch Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Branch</label>
                            <select 
                                value={data.branch} 
                                onChange={e => setData('branch', e.target.value)} 
                                className={`${inputStyle} cursor-pointer appearance-none`}
                            >
                                <option value="">Select Branch</option>
                                {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                            </select>
                            {errors.branch && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.branch}</p>}
                        </div>

                        {/* System Role */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">System Role</label>
                            <select 
                                value={data.role} 
                                onChange={e => setData('role', e.target.value)} 
                                className={`${inputStyle} cursor-pointer appearance-none`}
                            >
                                <option value="">Select Role</option>
                                {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                            {errors.role && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.role}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                className={inputStyle}
                                placeholder="••••••••"
                                autoComplete="new-password" // 👈 ব্রাউজারকে একদম নতুন পাসওয়ার্ড ফিল্ড হিসেবে ট্রিট করতে বাধ্য করে
                            />
                            {errors.password && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Confirm Password</label>
                            <input 
                                type="password" 
                                value={data.password_confirmation} 
                                onChange={e => setData('password_confirmation', e.target.value)} 
                                className={inputStyle}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* ফর্ম ফুটার অ্যাকশন বাটন */}
                    <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                        <Link 
                            href={route('users.index')} 
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 transition-all"
                        >
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-all shadow-sm shadow-indigo-600/10"
                        >
                            <FiSave className="h-4 w-4" /> 
                            {processing ? 'Processing...' : 'Create User Account'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}