import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FiArrowLeft, FiEdit2, FiMail, FiPhone, FiBriefcase, FiMapPin, FiUser,
    FiCalendar, FiUsers, FiShield, FiDollarSign, FiFileText, FiDownload,
    FiCheckCircle, FiXCircle, FiHeart, FiDroplet,
} from 'react-icons/fi';

// Same status chip tokens used on the Employees master list.
const STATUS = {
    1: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500' },
    0: { label: 'Inactive', classes: 'bg-slate-100 text-slate-600 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500' },
    2: { label: 'Resigned', classes: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500' },
    3: { label: 'Terminated', classes: 'bg-red-50 text-red-700 border-l-4 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500' },
};

function formatDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return 'N/A';
    const n = Number(value);
    if (isNaN(n)) return 'N/A';
    return `৳ ${n.toLocaleString('en-BD')}`;
}

export default function Show({ employee }) {
    const st = STATUS[employee.status] || STATUS[0];
    const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

    // Field block for the info-grid panels — bordered box, uppercase label, value.
    const Field = ({ label, value, mono = false, span = false }) => (
        <div className={`bg-slate-50 dark:bg-slate-950/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800 ${span ? 'sm:col-span-2' : ''}`}>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                {label}
            </span>
            <span className={`text-slate-800 dark:text-slate-200 font-semibold text-[14px] block mt-1 ${mono ? 'font-mono' : ''}`}>
                {value || 'N/A'}
            </span>
        </div>
    );

    const Panel = ({ children }) => (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
            {children}
        </div>
    );

    const PanelHeader = ({ icon: Icon, children }) => (
        <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {children}
            </h4>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Management</h2>}
        >
            <Head title={`Profile - ${employee.full_name}`} />

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
                                    Administration &nbsp;›&nbsp; Employees &nbsp;›&nbsp; Profile
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Employee Profile Details
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Left Column: Identity Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm p-6 flex flex-col items-center text-center h-fit">
                            {employee.profile_photo ? (
                                <img
                                    src={`/storage/${employee.profile_photo}`}
                                    alt={employee.full_name}
                                    className="h-20 w-20 rounded-sm object-cover border border-slate-300 dark:border-slate-700 mb-4"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-sm bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-2xl font-bold border border-blue-200 dark:border-blue-500/20 mb-4">
                                    {getInitials(employee.full_name)}
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{employee.full_name}</h3>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                                {employee.employee_id || 'N/A'}
                            </p>

                            <div className="mt-4">
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${st.classes}`}>
                                    {st.label}
                                </span>
                            </div>

                            <hr className="w-full my-5 border-slate-200 dark:border-slate-800" />

                            <div className="w-full space-y-4 text-left text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shrink-0">
                                        <FiBriefcase className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">Designation</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 text-[13px]">{employee.designation?.title || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shrink-0">
                                        <FiMapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">Branch / Department</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 text-[13px]">
                                            {employee.branch?.name || 'N/A'} · {employee.department?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shrink-0">
                                        <FiCalendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-none">Joining Date</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 text-[13px]">{formatDate(employee.joining_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={route('employees.edit', employee.id)}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                            >
                                <FiEdit2 className="h-4 w-4" />
                                Modify Profile
                            </Link>
                        </div>

                        {/* Right Column: Detailed Information */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Personal Information */}
                            <Panel>
                                <PanelHeader icon={FiUser}>Personal Information</PanelHeader>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Gender" value={employee.gender} />
                                    <Field label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                                    <Field label="Blood Group" value={employee.blood_group} />
                                    <Field label="Marital Status" value={employee.marital_status} />
                                    <Field label="Father's Name" value={employee.father_name} />
                                    <Field label="Mother's Name" value={employee.mother_name} />
                                    <Field label="National ID / NID" value={employee.national_id} mono />
                                    <Field label="Nationality" value={employee.nationality} />
                                    <Field label="Religion" value={employee.religion} span />
                                </div>
                            </Panel>

                            {/* Contact Information */}
                            <Panel>
                                <PanelHeader icon={FiMail}>Contact Information</PanelHeader>
                                <div className="p-5 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800 gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Email Address</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block text-[13px]">{employee.email || 'N/A'}</span>
                                        </div>
                                        {employee.email && (
                                            <a
                                                href={`mailto:${employee.email}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors self-start sm:self-center"
                                            >
                                                <FiMail className="h-3.5 w-3.5" /> Send Mail
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800 gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Phone / Alternative</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block text-[13px]">
                                                {employee.phone || 'N/A'} {employee.alternative_phone ? `/ ${employee.alternative_phone}` : ''}
                                            </span>
                                        </div>
                                        {employee.phone && (
                                            <a
                                                href={`tel:${employee.phone}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors self-start sm:self-center"
                                            >
                                                <FiPhone className="h-3.5 w-3.5" /> Call Now
                                            </a>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                        <Field label="Present Address" value={employee.present_address} />
                                        <Field label="Permanent Address" value={employee.permanent_address} />
                                    </div>
                                </div>
                            </Panel>

                            {/* Emergency Contact */}
                            <Panel>
                                <PanelHeader icon={FiHeart}>Emergency Contact</PanelHeader>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Field label="Name" value={employee.emergency_contact_name} />
                                    <Field label="Phone" value={employee.emergency_contact_phone} mono />
                                    <Field label="Relation" value={employee.emergency_contact_relation} />
                                </div>
                            </Panel>

                            {/* Office Placement & Employment */}
                            <Panel>
                                <PanelHeader icon={FiBriefcase}>Office Placement & Employment</PanelHeader>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Branch" value={employee.branch?.name} />
                                    <Field label="Department" value={employee.department?.name} />
                                    <Field label="Designation" value={employee.designation?.title} />
                                    <Field
                                        label="Reporting Manager"
                                        value={
                                            employee.reporting_manager
                                                ? `${employee.reporting_manager.first_name || ''} ${employee.reporting_manager.last_name || ''}`.trim()
                                                : null
                                        }
                                    />
                                    <Field label="Employment Type" value={employee.employment_type} />
                                    <Field label="Joining Date" value={formatDate(employee.joining_date)} />
                                    <Field label="Confirmation Date" value={formatDate(employee.confirmation_date)} />
                                    <Field label="Termination Date" value={formatDate(employee.termination_date)} />
                                </div>
                            </Panel>

                            {/* Login Access & Financials */}
                            <Panel>
                                <PanelHeader icon={FiShield}>Login Access & Financials</PanelHeader>
                                <div className="p-5 space-y-4">
                                    <div className={`flex items-center gap-3 p-4 rounded-sm border ${
                                        employee.has_login_access
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                                            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                                    }`}>
                                        {employee.has_login_access ? (
                                            <FiCheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        ) : (
                                            <FiXCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                                        )}
                                        <div>
                                            <p className={`text-xs font-bold ${employee.has_login_access ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-700 dark:text-red-400'}`}>
                                                {employee.has_login_access ? 'System Login Access Enabled' : 'System Login Access Disabled'}
                                            </p>
                                            {employee.has_login_access && employee.user && (
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                                    Linked account: {employee.user.name} ({employee.user.email})
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Basic Salary" value={formatMoney(employee.basic_salary)} mono />
                                        <Field label="Gross Salary" value={formatMoney(employee.gross_salary)} mono />
                                    </div>
                                </div>
                            </Panel>

                            {/* Documents */}
                            <Panel>
                                <PanelHeader icon={FiFileText}>Documents</PanelHeader>
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                <FiFileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">NID Attachment</p>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    {employee.nid_file ? 'File uploaded' : 'Not uploaded'}
                                                </p>
                                            </div>
                                        </div>
                                        {employee.nid_file && (
                                            <a
                                                href={`/storage/${employee.nid_file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <FiDownload className="h-3.5 w-3.5" /> View
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-sm border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                <FiFileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Curriculum Vitae (CV)</p>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    {employee.cv_file ? 'File uploaded' : 'Not uploaded'}
                                                </p>
                                            </div>
                                        </div>
                                        {employee.cv_file && (
                                            <a
                                                href={`/storage/${employee.cv_file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <FiDownload className="h-3.5 w-3.5" /> View
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
