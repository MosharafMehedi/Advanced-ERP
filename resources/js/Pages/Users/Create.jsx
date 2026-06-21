import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, 
    FiBriefcase, FiLayers, FiMapPin, FiShield, FiLock 
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Create({ roles, departments, branches }) {
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
                    confirmButtonColor: '#4f46e5',
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Please fix the validation errors in the form.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444',
                });
            }
        });
    };

    // Form input control styles with icons space
    const inputWrapperStyle = "relative mt-1";
    const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 pointer-events-none";
    const inputStyle = "block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm";

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create User</h2>}
        >
            <Head title="Create User" />

            <div>
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Information</h3>
                            <Link
                                href={route('users.index')}
                                className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                            >
                                <FiArrowLeft /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiUser className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Enter full name"
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiMail className={iconStyle} />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={inputStyle}
                                            placeholder="example@domain.com"
                                            autoComplete="none"
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiPhone className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={inputStyle}
                                            placeholder="+880 1XXXXXXXXX"
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                </div>

                                {/* Employee ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiBriefcase className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.employee_id}
                                            onChange={e => setData('employee_id', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. MS-102"
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.employee_id && <div className="text-red-500 text-xs mt-1">{errors.employee_id}</div>}
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLayers className={iconStyle} />
                                        <input
                                            type="text"
                                            value={data.designation}
                                            onChange={e => setData('designation', e.target.value)}
                                            className={inputStyle}
                                            placeholder="Software Engineer"
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.designation && <div className="text-red-500 text-xs mt-1">{errors.designation}</div>}
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLayers className={iconStyle} />
                                        <select
                                            value={data.department_id}
                                            onChange={e => setData('department_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required // 👈 Added
                                        >
                                            <option value="">Select Department</option>
                                            {departments && departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.department_id && <div className="text-red-500 text-xs mt-1">{errors.department_id}</div>}
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiMapPin className={iconStyle} />
                                        <select
                                            value={data.branch_id}
                                            onChange={e => setData('branch_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required // 👈 Added
                                        >
                                            <option value="">Select Branch</option>
                                            {branches && branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.branch_id && <div className="text-red-500 text-xs mt-1">{errors.branch_id}</div>}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiShield className={iconStyle} />
                                        <select
                                            value={data.role_id}
                                            onChange={e => setData('role_id', e.target.value)}
                                            className={`${inputStyle} cursor-pointer`}
                                            required // 👈 Added
                                        >
                                            <option value="">Select Role</option>
                                            {roles && roles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.role_id && <div className="text-red-500 text-xs mt-1">{errors.role_id}</div>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLock className={iconStyle} />
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className={inputStyle}
                                            required // 👈 Added
                                        />
                                    </div>
                                    {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</label>
                                    <div className={inputWrapperStyle}>
                                        <FiLock className={iconStyle} />
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            className={inputStyle}
                                            required // 👈 Added
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    <FiSave /> {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}