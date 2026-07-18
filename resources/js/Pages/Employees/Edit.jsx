import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiSave, FiX, FiUploadCloud, FiArrowLeft, FiUser, FiFile } from 'react-icons/fi';

const inputStyle = "w-full text-sm px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
const compactInputStyle = "w-full text-sm px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
const labelStyle = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5";
const compactLabelStyle = "block text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1";
const errorStyle = "text-red-600 dark:text-red-400 text-xs mt-1 font-medium";

const Panel = ({ children }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
        {children}
    </div>
);

const PanelHeader = ({ children }) => (
    <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            {children}
        </h3>
    </div>
);

const ExistingFileLink = ({ url, label = 'View current file' }) => {
    if (!url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400 hover:underline mt-1"
        >
            <FiFile className="h-3 w-3" /> {label}
        </a>
    );
};

export default function Edit({ employee, branches, departments, designations, managers, users }) {
    const { data, setData, post, processing, errors } = useForm({
        // Personal Information
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        profile_photo: null,
        gender: employee.gender || '',
        date_of_birth: employee.date_of_birth || '',
        blood_group: employee.blood_group || '',
        marital_status: employee.marital_status || '',
        father_name: employee.father_name || '',
        mother_name: employee.mother_name || '',
        national_id: employee.national_id || '',
        nid_file: null,
        nationality: employee.nationality || 'Bangladeshi',
        religion: employee.religion || '',
        email: employee.email || '',
        phone: employee.phone || '',
        alternative_phone: employee.alternative_phone || '',
        present_address: employee.present_address || '',
        permanent_address: employee.permanent_address || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_relation: employee.emergency_contact_relation || '',

        // Office Placement & HR
        branch_id: employee.branch_id || '',
        department_id: employee.department_id || '',
        designation_id: employee.designation_id || '',
        reporting_manager_id: employee.reporting_manager_id || '',
        employment_type: employee.employment_type || 'Permanent',
        joining_date: employee.joining_date || '',
        confirmation_date: employee.confirmation_date || '',
        termination_date: employee.termination_date || '',
        status: String(employee.status ?? '1'),

        // System Access & Salary
        has_login_access: !!employee.has_login_access,
        user_id: employee.user_id || '',
        basic_salary: employee.basic_salary ?? '0',
        gross_salary: employee.gross_salary ?? '0',
        cv_file: null,
        _method: 'put',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('employees.update', employee.id), {
            forceFormData: true,
        });
    };

    const fileBaseUrl = '/storage/';

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Management</h2>}
        >
            <Head title={`Edit — ${employee.first_name} ${employee.last_name ?? ''}`} />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-6xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiUser className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Employees &nbsp;›&nbsp; Edit
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Edit Employee — <span className="font-mono">{employee.employee_id}</span>
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={route('employees.index')}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" />
                            Back to List
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* LEFT & CENTER: Personal & Core Office Details */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* 1. Personal Profile */}
                                <Panel>
                                    <PanelHeader>1. Personal Information</PanelHeader>
                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* First & Last Name — সবার উপরে */}
                                            <div>
                                                <label className={labelStyle}>First Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.first_name}
                                                    onChange={e => setData('first_name', e.target.value)}
                                                    className={inputStyle}
                                                />
                                                {errors.first_name && <div className={errorStyle}>{errors.first_name}</div>}
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Last Name</label>
                                                <input
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={e => setData('last_name', e.target.value)}
                                                    className={inputStyle}
                                                />
                                            </div>

                                            {/* Employee ID — Immutable, read-only */}
                                            <div>
                                                <label className={labelStyle}>Employee ID</label>
                                                <input
                                                    type="text"
                                                    value={employee.employee_id}
                                                    disabled
                                                    readOnly
                                                    className={`${inputStyle} font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed`}
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    সিস্টেম-জেনারেটেড আইডি, পরিবর্তনযোগ্য নয়।
                                                </p>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Gender *</label>
                                                <select required value={data.gender} onChange={e => setData('gender', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.gender && <div className={errorStyle}>{errors.gender}</div>}
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Date of Birth</label>
                                                <input type="date" value={data.date_of_birth || ''} onChange={e => setData('date_of_birth', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Blood Group</label>
                                                <select value={data.blood_group} onChange={e => setData('blood_group', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                    <option value="">Select Blood Group</option>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Marital Status</label>
                                                <select value={data.marital_status} onChange={e => setData('marital_status', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                    <option value="">Select Status</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Divorced">Divorced</option>
                                                    <option value="Widowed">Widowed</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>National ID / NID Number</label>
                                                <input type="text" value={data.national_id} onChange={e => setData('national_id', e.target.value)} className={`${inputStyle} font-mono`} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Father's Name</label>
                                                <input type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Mother's Name</label>
                                                <input type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Nationality</label>
                                                <input type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Religion</label>
                                                <input type="text" value={data.religion} onChange={e => setData('religion', e.target.value)} placeholder="e.g. Islam, Hinduism" className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Email Address</label>
                                                <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)} className={inputStyle} />
                                                {errors.email && <div className={errorStyle}>{errors.email}</div>}
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Phone Number</label>
                                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Alternative Phone</label>
                                                <input type="text" value={data.alternative_phone} onChange={e => setData('alternative_phone', e.target.value)} className={inputStyle} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Upload NID (JPG, PNG, PDF)</label>
                                                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-sm p-2.5 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-600 transition-colors relative">
                                                    <input
                                                        type="file"
                                                        onChange={e => setData('nid_file', e.target.files[0])}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                                                        {data.nid_file ? data.nid_file.name : 'Choose new file to replace'}
                                                    </span>
                                                </div>
                                                <ExistingFileLink url={employee.nid_file ? fileBaseUrl + employee.nid_file : null} label="View current NID" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelStyle}>Present Address</label>
                                                <textarea rows="2" value={data.present_address} onChange={e => setData('present_address', e.target.value)} className={`${inputStyle} resize-none`} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Permanent Address</label>
                                                <textarea rows="2" value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} className={`${inputStyle} resize-none`} />
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800 space-y-3">
                                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                Emergency Contact Person
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className={compactLabelStyle}>Name</label>
                                                    <input type="text" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} className={compactInputStyle} />
                                                </div>
                                                <div>
                                                    <label className={compactLabelStyle}>Phone</label>
                                                    <input type="text" value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', e.target.value)} className={compactInputStyle} />
                                                </div>
                                                <div>
                                                    <label className={compactLabelStyle}>Relation</label>
                                                    <input type="text" value={data.emergency_contact_relation} onChange={e => setData('emergency_contact_relation', e.target.value)} placeholder="e.g. Brother, Spouse" className={compactInputStyle} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Panel>

                                {/* 2. HR & Office Structure */}
                                <Panel>
                                    <PanelHeader>2. Office Placement & Dates</PanelHeader>
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelStyle}>Branch</label>
                                            <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="">Select Branch</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Department</label>
                                            <select value={data.department_id} onChange={e => setData('department_id', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="">Select Department</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Designation</label>
                                            <select value={data.designation_id} onChange={e => setData('designation_id', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="">Select Designation</option>
                                                {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Reporting Manager</label>
                                            <select value={data.reporting_manager_id} onChange={e => setData('reporting_manager_id', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="">Select Manager</option>
                                                {managers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.employee_id})</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Employment Type *</label>
                                            <select required value={data.employment_type} onChange={e => setData('employment_type', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="Permanent">Permanent</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Intern">Intern</option>
                                                <option value="Part Time">Part Time</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Joining Date</label>
                                            <input type="date" value={data.joining_date || ''} onChange={e => setData('joining_date', e.target.value)} className={inputStyle} />
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Confirmation Date</label>
                                            <input type="date" value={data.confirmation_date || ''} onChange={e => setData('confirmation_date', e.target.value)} className={inputStyle} />
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Termination/End Date</label>
                                            <input type="date" value={data.termination_date || ''} onChange={e => setData('termination_date', e.target.value)} className={inputStyle} />
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            {/* RIGHT SIDEBAR: Photo Upload, System Access Control & Financials */}
                            <div className="space-y-4">
                                {/* Profile Image Box */}
                                <Panel>
                                    <PanelHeader>Avatar Gallery</PanelHeader>
                                    <div className="p-5">
                                        {employee.profile_photo && !data.profile_photo && (
                                            <img
                                                src={fileBaseUrl + employee.profile_photo}
                                                alt="Current profile"
                                                className="w-full h-32 object-cover rounded-sm border border-slate-200 dark:border-slate-800 mb-3"
                                            />
                                        )}
                                        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-sm p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-600 transition-colors relative">
                                            <input
                                                type="file"
                                                onChange={e => setData('profile_photo', e.target.files[0])}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <FiUploadCloud className="w-8 h-8 text-blue-700 dark:text-blue-400 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {employee.profile_photo ? 'Click to replace photo' : 'Click to upload Profile Image'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">Supports JPG, PNG up to 2MB</p>
                                            {data.profile_photo && (
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-2 border-t border-slate-200 dark:border-slate-800 pt-2 truncate">
                                                    {data.profile_photo.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Panel>

                                {/* System Credentials & Integration Access Control */}
                                <Panel>
                                    <PanelHeader>3. Login Access Setup</PanelHeader>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-sm">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Allow System Login Access</span>
                                            <input
                                                type="checkbox"
                                                checked={data.has_login_access}
                                                onChange={e => {
                                                    setData(prev => ({
                                                        ...prev,
                                                        has_login_access: e.target.checked,
                                                        user_id: e.target.checked ? prev.user_id : ''
                                                    }));
                                                }}
                                                className="w-4 h-4 accent-blue-700 cursor-pointer"
                                            />
                                        </div>

                                        {data.has_login_access ? (
                                            <div className="space-y-2 bg-blue-50/50 dark:bg-blue-500/10 p-3 rounded-sm border border-blue-200 dark:border-blue-500/20">
                                                <label className="block text-xs font-bold mb-1 text-blue-800 dark:text-blue-300">Link Login User Account</label>
                                                <select
                                                    value={data.user_id}
                                                    onChange={e => setData('user_id', e.target.value)}
                                                    className={`${compactInputStyle} cursor-pointer`}
                                                >
                                                    <option value="">Select User Profile</option>
                                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                                </select>
                                                <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed mt-1">
                                                    Leaving this empty with active toggle will trigger auto-generation of account configurations.
                                                </p>
                                                {errors.user_id && <div className={errorStyle}>{errors.user_id}</div>}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-500/20 rounded-sm leading-relaxed">
                                                <strong>Access Disabled:</strong> এই কর্মচারীর জন্য কোনো ইউজার অ্যাকাউন্ট লিঙ্ক বা সিস্টেম লগইন ক্রেডেনশিয়াল থাকবে না।
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelStyle}>Employee Operational Status</label>
                                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={`${inputStyle} cursor-pointer`}>
                                                <option value="1">Active</option>
                                                <option value="0">Inactive</option>
                                                <option value="2">Resigned</option>
                                                <option value="3">Terminated</option>
                                            </select>
                                        </div>
                                    </div>
                                </Panel>

                                {/* Financials & CV Attachments */}
                                <Panel>
                                    <PanelHeader>4. Financials & CV</PanelHeader>
                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelStyle}>Basic Salary</label>
                                                <input type="number" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Gross Salary</label>
                                                <input type="number" value={data.gross_salary} onChange={e => setData('gross_salary', e.target.value)} className={inputStyle} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>Upload Curriculum Vitae (CV)</label>
                                            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-sm p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-600 transition-colors relative">
                                                <input
                                                    type="file"
                                                    onChange={e => setData('cv_file', e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate block">
                                                    {data.cv_file ? data.cv_file.name : 'Choose new file to replace'}
                                                </span>
                                            </div>
                                            <ExistingFileLink url={employee.cv_file ? fileBaseUrl + employee.cv_file : null} label="View current CV" />
                                        </div>
                                    </div>
                                </Panel>

                                {/* Bottom Action Buttons */}
                                <div className="flex gap-2">
                                    <Link
                                        href={route('employees.index')}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <FiX className="h-4 w-4" /> Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiSave className="h-4 w-4" /> {processing ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
