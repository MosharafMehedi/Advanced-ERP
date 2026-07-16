import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    FiArrowLeft, FiPrinter, FiCheckCircle, FiClock, FiXCircle,
    FiDollarSign, FiUser, FiCalendar, FiCreditCard, FiFileText,
    FiTrendingUp, FiTrendingDown, FiHash,
} from 'react-icons/fi';

const STATUS_STYLES = {
    'Draft':     { classes: 'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500' },
    'Generated': { classes: 'bg-amber-50 text-amber-800 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500' },
    'Approved':  { classes: 'bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500' },
    'Paid':      { classes: 'bg-emerald-50 text-emerald-700 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500' },
    'Cancelled': { classes: 'bg-red-50 text-red-700 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500' },
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2,
    }).format(amount || 0);
}

export default function Show({ payroll }) {
    const { globalSettings } = usePage().props;
    const statusStyle = STATUS_STYLES[payroll.status] || STATUS_STYLES['Draft'];

    const { data, setData, processing } = useForm({
        payment_method: 'Bank Transfer',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
    });

    const monthLabel = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' });
    const earnings = payroll.details?.filter(d => d.type === 'Allowance') || [];
    const deductions = payroll.details?.filter(d => d.type === 'Deduction') || [];

    const handleApprove = () => {
        Swal.fire({
            title: 'Approve this payslip?',
            text: 'Once approved, it can be released for payment.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1d4ed8',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, approve it',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('payrolls.update', payroll.id), { action: 'approve' }, {
                    onSuccess: () => Swal.fire({ title: 'Approved', icon: 'success', timer: 1400, showConfirmButton: false, ...swalTheme() }),
                    onError: (errors) => Swal.fire({ title: 'Could not approve', text: errors.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Confirm salary disbursement?',
            text: `${formatCurrency(payroll.net_payable)} will be marked as paid via ${data.payment_method}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, mark as paid',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('payrolls.update', payroll.id), { ...data, action: 'pay' }, {
                    onSuccess: () => Swal.fire({ title: 'Salary Released', icon: 'success', timer: 1400, showConfirmButton: false, ...swalTheme() }),
                    onError: (errors) => Swal.fire({ title: 'Could not process payment', text: errors.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    const handleCancel = () => {
        Swal.fire({
            title: 'Cancel this payslip?',
            text: 'This will mark the slip as Cancelled. It cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, cancel it',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('payrolls.update', payroll.id), { action: 'cancel' }, {
                    onSuccess: () => Swal.fire({ title: 'Cancelled', icon: 'success', timer: 1400, showConfirmButton: false, ...swalTheme() }),
                    onError: (errors) => Swal.fire({ title: 'Could not cancel', text: errors.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Salary Slip</h2>}
        >
            <Head title={`Payslip · ${payroll.slip_no || payroll.id}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .printable-area { box-shadow: none !important; border: none !important; }
                    body { background: #fff !important; }
                }
            `}</style>

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-4xl">

                    {/* Page header bar */}
                    <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiFileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Payroll &nbsp;›&nbsp; Payslip
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {payroll.slip_no || `#${payroll.id}`}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route('payrolls.index')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <FiArrowLeft className="h-3.5 w-3.5" />
                                Back to List
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-sm transition-colors"
                            >
                                <FiPrinter className="h-3.5 w-3.5" />
                                Print Payslip
                            </button>
                        </div>
                    </div>

                    {/* Payslip document */}
                    <div className="printable-area bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">

                        {/* Letterhead */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {globalSettings?.logo_url && (
                                    <img src={globalSettings.logo_url} alt="" className="h-10 w-10 object-contain" />
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {globalSettings?.app_name || 'Company Name'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Salary Slip &middot; {monthLabel}, {payroll.year}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-sm border-l-4 ${statusStyle.classes}`}>
                                {payroll.status}
                            </span>
                        </div>

                        {/* Employee + slip metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-b border-slate-200 dark:border-slate-800 text-sm bg-slate-50 dark:bg-slate-900/60">
                            <div className="space-y-1.5">
                                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <FiUser className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Employee:</span>
                                    <span className="font-semibold">{payroll.employee?.first_name} {payroll.employee?.last_name}</span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <FiHash className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Employee ID:</span>
                                    <span className="font-semibold">{payroll.employee?.employee_id}</span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="text-slate-500 dark:text-slate-400 ml-5">Department:</span>
                                    <span className="font-semibold">{payroll.employee?.department?.name || 'N/A'}</span>
                                </p>
                            </div>
                            <div className="space-y-1.5 md:text-right">
                                <p className="flex items-center md:justify-end gap-2 text-slate-700 dark:text-slate-300">
                                    <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Attendance:</span>
                                    <span className="font-semibold">{payroll.present_days}/{payroll.total_days} days present</span>
                                </p>
                                <p className="flex items-center md:justify-end gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="text-slate-500 dark:text-slate-400">Gross Contractual:</span>
                                    <span className="font-semibold">{formatCurrency(payroll.gross_salary)}</span>
                                </p>
                                {payroll.status === 'Paid' && (
                                    <p className="flex items-center md:justify-end gap-2 text-slate-700 dark:text-slate-300">
                                        <FiCreditCard className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="text-slate-500 dark:text-slate-400">Paid via:</span>
                                        <span className="font-semibold">{payroll.payment_method} on {payroll.payment_date}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Earnings & deductions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                            <div className="p-6">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-3">
                                    <FiTrendingUp className="h-3.5 w-3.5" /> Earnings & Allowances
                                </h4>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {earnings.length > 0 ? earnings.map(d => (
                                            <tr key={d.id}>
                                                <td className="py-1.5 text-slate-600 dark:text-slate-300">{d.name}</td>
                                                <td className="py-1.5 text-right font-medium text-slate-800 dark:text-slate-200">{formatCurrency(d.amount)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td className="py-2 text-slate-400 text-xs">No earnings recorded</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400 mb-3">
                                    <FiTrendingDown className="h-3.5 w-3.5" /> Deductions
                                </h4>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {deductions.length > 0 ? deductions.map(d => (
                                            <tr key={d.id}>
                                                <td className="py-1.5 text-slate-600 dark:text-slate-300">{d.name}</td>
                                                <td className="py-1.5 text-right font-medium text-red-600 dark:text-red-400">-{formatCurrency(d.amount)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td className="py-2 text-slate-400 text-xs">No deductions</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Net payable summary */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div className="text-sm space-y-1">
                                <p className="text-slate-600 dark:text-slate-300">
                                    Total Earnings: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payroll.total_allowance)}</span>
                                </p>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Total Deductions: <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(payroll.total_deduction)}</span>
                                </p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Net Payable</p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{formatCurrency(payroll.net_payable)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions — not shown when printing */}
                    {payroll.status === 'Generated' && (
                        <div className="no-print mt-4 bg-white dark:bg-slate-900 p-5 rounded-sm shadow-sm border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <FiClock className="h-4 w-4 text-amber-500" />
                                This slip is awaiting approval before it can be paid out.
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-400 bg-white dark:bg-slate-950 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <FiXCircle className="h-3.5 w-3.5" /> Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors"
                                >
                                    <FiCheckCircle className="h-3.5 w-3.5" /> Approve Slip
                                </button>
                            </div>
                        </div>
                    )}

                    {payroll.status === 'Approved' && (
                        <div className="no-print mt-4 bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-emerald-300 dark:border-emerald-500/30 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-500/10">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                    <FiDollarSign className="h-4 w-4" /> Release & Disburse Salary
                                </h3>
                            </div>
                            <form onSubmit={handlePaySubmit} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Payment Method
                                    </label>
                                    <select
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Mobile Banking">Mobile Banking</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Transaction Reference
                                    </label>
                                    <input
                                        type="text"
                                        value={data.transaction_reference}
                                        onChange={e => setData('transaction_reference', e.target.value)}
                                        placeholder="e.g. Bank Ref No"
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-sm transition-colors disabled:opacity-50"
                                >
                                    <FiCheckCircle className="h-3.5 w-3.5" />
                                    {processing ? 'Processing...' : 'Mark as Paid'}
                                </button>
                            </form>
                        </div>
                    )}

                    {payroll.status === 'Paid' && (
                        <div className="no-print mt-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-sm p-4 flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-400">
                            <FiCheckCircle className="h-4 w-4" />
                            Salary disbursed via {payroll.payment_method} on {payroll.payment_date}
                            {payroll.transaction_reference && <> &middot; Ref: {payroll.transaction_reference}</>}
                        </div>
                    )}

                    {payroll.status === 'Cancelled' && (
                        <div className="no-print mt-4 bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-sm p-4 flex items-center gap-2 text-sm text-red-800 dark:text-red-400">
                            <FiXCircle className="h-4 w-4" />
                            This payslip has been cancelled.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
