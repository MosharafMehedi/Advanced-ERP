import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    FiArrowLeft, FiSave, FiUser, FiCalendar, FiClock,
    FiDollarSign, FiPlus, FiX, FiCheckCircle, FiAlertCircle,
    FiBriefcase, FiUsers, FiLock
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

export default function Create({ employees }) {
    const { errors } = usePage().props;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const { data, setData, post, transform, processing } = useForm({
        employee_id: '',
        year: currentYear,
        month: currentMonth,
        bonus: 0,
        arrears: 0,
        fine: 0,
        loan_deduction: 0,
    });

    // এই ৭টা ফিল্ড এখন শুধু preview — PayrollService সরাসরি AttendanceService থেকে
    // এই সংখ্যাগুলো নিজে টেনে নেয়, ফর্মে যা লেখা থাকুক না কেন সেটা ব্যাকএন্ডে
    // ব্যবহার হয় না। তাই এগুলো স্থানীয় state এ রাখা হচ্ছে, ফর্মের data তে না।
    const [attendancePreview, setAttendancePreview] = useState({
        total_days: null, working_days: null, present_days: null, absent_days: null,
        leave_with_pay: null, leave_without_pay: null, late_days: null,
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [attendanceLoaded, setAttendanceLoaded] = useState(false);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    useEffect(() => {
        if (data.employee_id) {
            const emp = employees.find(e => e.id === parseInt(data.employee_id));
            setSelectedEmployee(emp || null);
        } else {
            setSelectedEmployee(null);
        }
    }, [data.employee_id]);

    // শুধু preview এর জন্য fetch — এখন আর ফর্ম ডেটার মধ্যে বসানো হচ্ছে না,
    // যাতে ইউজার ভুল করে এটা এডিট করে ভাবতে না পারেন যে এটা প্রভাব ফেলবে।
    useEffect(() => {
        if (!data.employee_id || !data.year || !data.month) {
            setAttendanceLoaded(false);
            return;
        }

        setAttendanceLoading(true);
        fetch(route('attendances.summary', [data.employee_id, data.year, data.month]))
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(summary => {
                setAttendancePreview(summary);
                setAttendanceLoaded(true);
            })
            .catch(() => setAttendanceLoaded(false))
            .finally(() => setAttendanceLoading(false));
    }, [data.employee_id, data.year, data.month]);

    const submitPayload = (forceNegative = false) => {
        // transform() injects force_negative into the outgoing payload at
        // submit time — safer than setData()+post() back-to-back, since
        // setData's state update wouldn't be reflected in the very next line.
        transform((formData) => ({ ...formData, force_negative: forceNegative }));
        post(route('payrolls.store'), {
            onError: (errs) => handleServerError(errs),
        });
    };

    const handleServerError = (errs) => {
        const message = errs.error || '';
        // Service নেগেটিভ net payable হলে নির্দিষ্ট শব্দ সহ exception থ্রো করে —
        // সেটা দেখলে HR কে জিজ্ঞেস করে force_negative দিয়ে আবার পাঠানোর সুযোগ দিই।
        if (message.includes('force_negative')) {
            Swal.fire({
                title: 'Net payable would be negative',
                text: message.replace(', or resubmit with force_negative to proceed anyway.', ''),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Proceed anyway',
                cancelButtonText: 'Let me fix it',
                ...swalTheme(),
            }).then((result) => {
                if (result.isConfirmed) {
                    submitPayload(true);
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitPayload(false);
    };

    const getMonthName = (monthNum) => {
        if (!monthNum) return '';
        return new Date(2000, parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
    };

    const previewBox = "w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 text-slate-500 dark:text-slate-400 cursor-not-allowed";

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Generate Salary Slip</h2>}
        >
            <Head title="Generate Salary Slip" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-5xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiDollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Payroll &nbsp;›&nbsp; Generate
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    New Salary Slip
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={route('payrolls.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" />
                            Back to List
                        </Link>
                    </div>

                    {/* Error messages */}
                    {errors.error && !errors.error.includes('force_negative') && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-l-4 border-red-600 rounded-sm text-sm flex items-center gap-2">
                            <FiAlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errors.error}</span>
                        </div>
                    )}

                    {/* Main form card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                        <form onSubmit={handleSubmit}>
                            {/* Employee Selection */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                    <FiUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Employee Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                            Employee <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.employee_id}
                                            onChange={e => setData('employee_id', e.target.value)}
                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                            required
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.employee_id && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.employee_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                            Year <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.year}
                                            onChange={e => setData('year', e.target.value)}
                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                            required
                                            min="2000"
                                            max="2100"
                                        />
                                        {errors.year && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.year}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                            Month <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.month}
                                            onChange={e => setData('month', e.target.value)}
                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                            required
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{getMonthName(m)}</option>
                                            ))}
                                        </select>
                                        {errors.month && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.month}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Employee Preview */}
                                {selectedEmployee && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-sm flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-sm bg-blue-200 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400">
                                                <FiUser className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    ID: {selectedEmployee.employee_id}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <FiBriefcase className="w-3 h-3" />
                                                {selectedEmployee.designation?.title || '—'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiUsers className="w-3 h-3" />
                                                {selectedEmployee.department?.name || '—'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attendance Section — READ-ONLY PREVIEW */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                                    <FiClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Attendance Details
                                    {attendanceLoading && (
                                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Loading from Attendance…</span>
                                    )}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                                    <FiLock className="h-3 w-3" />
                                    Read-only — pulled directly from the Attendance module and cannot be overridden here. Fix the underlying attendance records if these look wrong.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Days</label>
                                        <input type="text" readOnly disabled value={attendancePreview.total_days ?? '—'} className={previewBox} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Working Days</label>
                                        <input type="text" readOnly disabled value={attendancePreview.working_days ?? '—'} className={previewBox} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Present Days</label>
                                        <input type="text" readOnly disabled value={attendancePreview.present_days ?? '—'} className={previewBox} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Absent Days</label>
                                        <input type="text" readOnly disabled value={attendancePreview.absent_days ?? '—'} className={previewBox} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Leave With Pay</label>
                                        <input type="text" readOnly disabled value={attendancePreview.leave_with_pay ?? '—'} className={previewBox} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Leave Without Pay</label>
                                        <input type="text" readOnly disabled value={attendancePreview.leave_without_pay ?? '—'} className={previewBox} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Late Days</label>
                                        <input type="text" readOnly disabled value={attendancePreview.late_days ?? '—'} className={previewBox} />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Adjustments */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                    <FiDollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Financial Adjustments
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                                            <FiPlus className="inline h-3 w-3 mr-0.5" /> Bonus (BDT)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.bonus}
                                            onChange={e => setData('bonus', e.target.value)}
                                            className="w-full text-sm bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 focus:border-emerald-600 dark:text-slate-300 transition-colors"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                                            <FiPlus className="inline h-3 w-3 mr-0.5" /> Arrears (BDT)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.arrears}
                                            onChange={e => setData('arrears', e.target.value)}
                                            className="w-full text-sm bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 focus:border-emerald-600 dark:text-slate-300 transition-colors"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                                            <FiX className="inline h-3 w-3 mr-0.5" /> Penalty/Fine (BDT)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.fine}
                                            onChange={e => setData('fine', e.target.value)}
                                            className="w-full text-sm bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus:border-red-600 dark:text-slate-300 transition-colors"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                                            <FiX className="inline h-3 w-3 mr-0.5" /> Loan Deduction (BDT)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.loan_deduction}
                                            onChange={e => setData('loan_deduction', e.target.value)}
                                            className="w-full text-sm bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus:border-red-600 dark:text-slate-300 transition-colors"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-b-sm">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        <FiCheckCircle className="inline h-3.5 w-3.5 text-emerald-600 mr-1" />
                                        All fields with <span className="text-red-500">*</span> are required
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link
                                            href={route('payrolls.index')}
                                            className="flex-1 sm:flex-none px-6 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiSave className="h-3.5 w-3.5" />
                                            {processing ? 'Processing...' : 'Generate Salary Slip'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
