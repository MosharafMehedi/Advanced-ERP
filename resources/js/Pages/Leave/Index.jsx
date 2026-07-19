import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    FiPlus, FiCheckCircle, FiXCircle, FiClock, FiCalendar,
    FiTrendingUp, FiTrendingDown, FiLayers, FiUser, FiFilter,
} from 'react-icons/fi';

const STATUS_STYLES = {
    'Pending':          'bg-amber-50 text-amber-800 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500',
    'Manager Approved': 'bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500',
    'Approved':         'bg-emerald-50 text-emerald-700 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500',
    'Rejected':         'bg-red-50 text-red-700 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500',
    'Cancelled':        'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500',
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

function SummaryCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value} <span className="text-xs font-normal text-slate-400">days</span></p>
            </div>
        </div>
    );
}

export default function Index({ requests, leaveTypes, balanceSummary, isHrOrAdmin, filters }) {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '', is_half_day: false, half_day_period: 'Morning' });
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const applyFilter = (status) => {
        setStatusFilter(status);
        router.get(route('leave-requests.index'), { status: status || undefined }, { preserveState: true });
    };

    const submitRequest = (e) => {
        e.preventDefault();
        router.post(route('leave-requests.store'), form, {
            onSuccess: () => {
                setShowRequestModal(false);
                setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '', is_half_day: false, half_day_period: 'Morning' });
                Swal.fire({ title: 'Leave requested', icon: 'success', timer: 1400, showConfirmButton: false, ...swalTheme() });
            },
            onError: (errs) => Swal.fire({ title: 'Could not submit', text: errs.error, icon: 'error', ...swalTheme() }),
        });
    };

    const toggleHalfDay = (checked) => {
        setForm(prev => ({
            ...prev,
            is_half_day: checked,
            end_date: checked ? prev.start_date : prev.end_date,
        }));
    };

    const decide = (leaveRequest, level, decision) => {
        const routeName = level === 'manager' ? 'leave-requests.managerAction' : 'leave-requests.hrAction';
        Swal.fire({
            title: decision === 'approve' ? 'Approve this leave?' : 'Reject this leave?',
            input: 'text',
            inputPlaceholder: 'Optional remarks',
            icon: decision === 'approve' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: decision === 'approve' ? '#059669' : '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: decision === 'approve' ? 'Yes, approve' : 'Yes, reject',
            ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.put(route(routeName, leaveRequest.id), { decision, remarks: res.value }, {
                    onSuccess: () => Swal.fire({ title: 'Decision recorded', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }),
                    onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    const cancelRequest = (leaveRequest) => {
        Swal.fire({
            title: 'Cancel this request?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, cancel it', ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.put(route('leave-requests.cancel', leaveRequest.id), {}, {
                    onSuccess: () => Swal.fire({ title: 'Cancelled', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }),
                });
            }
        });
    };

    const totals = balanceSummary?.totals;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Leave Management</h2>}>
            <Head title="Leave" />

            <div className="max-w-6xl mx-auto space-y-4">

                {/* Summary cards */}
                {totals && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SummaryCard icon={FiLayers} label="Total Allocated" value={totals.allocated} accent="bg-blue-700 text-white" />
                        <SummaryCard icon={FiTrendingDown} label="Used" value={totals.used} accent="bg-slate-700 text-white" />
                        <SummaryCard icon={FiClock} label="Pending Approval" value={totals.pending} accent="bg-amber-500 text-white" />
                        <SummaryCard icon={FiTrendingUp} label="Remaining" value={totals.remaining} accent="bg-emerald-600 text-white" />
                    </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <FiFilter className="h-3.5 w-3.5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={e => applyFilter(e.target.value)}
                            className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-1.5 px-2 dark:text-slate-300"
                        >
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm"
                    >
                        <FiPlus className="h-3.5 w-3.5" /> Request Leave
                    </button>
                </div>

                {/* Requests list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                                {isHrOrAdmin && <th className="text-left px-5 py-2.5">Employee</th>}
                                <th className="text-left px-5 py-2.5">Type</th>
                                <th className="text-left px-5 py-2.5">Dates</th>
                                <th className="text-left px-5 py-2.5">Days</th>
                                <th className="text-left px-5 py-2.5">Reason</th>
                                <th className="text-left px-5 py-2.5">Status</th>
                                <th className="text-right px-5 py-2.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {requests.data.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    {isHrOrAdmin && (
                                        <td className="px-5 py-2.5">
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{r.employee?.first_name} {r.employee?.last_name}</p>
                                            <p className="text-xs text-slate-400">{r.employee?.employee_id}</p>
                                        </td>
                                    )}
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{r.leave_type?.name}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">
                                        {r.start_date} → {r.end_date}
                                        {r.is_half_day && (
                                            <span className="ml-1.5 inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                Half Day · {r.half_day_period}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{r.total_days}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={r.reason}>{r.reason || '—'}</td>
                                    <td className="px-5 py-2.5">
                                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-sm border-l-4 ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                                    </td>
                                    <td className="px-5 py-2.5 text-right space-x-1.5">
                                        {r.status === 'Pending' && r.manager_id && isHrOrAdmin && (
                                            <>
                                                <button onClick={() => decide(r, 'manager', 'approve')} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10">Manager Approve</button>
                                                <button onClick={() => decide(r, 'manager', 'reject')} className="px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">Reject</button>
                                            </>
                                        )}
                                        {((r.status === 'Manager Approved') || (r.status === 'Pending' && !r.manager_id)) && isHrOrAdmin && (
                                            <>
                                                <button onClick={() => decide(r, 'hr', 'approve')} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10">HR Approve</button>
                                                <button onClick={() => decide(r, 'hr', 'reject')} className="px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">Reject</button>
                                            </>
                                        )}
                                        {['Pending', 'Manager Approved'].includes(r.status) && !isHrOrAdmin && (
                                            <button onClick={() => cancelRequest(r)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.data.length === 0 && (
                                <tr><td colSpan={isHrOrAdmin ? 7 : 6} className="px-5 py-8 text-center text-slate-400 text-sm">No leave requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-md">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Request Leave</h3>
                            <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitRequest} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Leave Type</label>
                                <select required value={form.leave_type_id} onChange={e => setForm({ ...form, leave_type_id: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300">
                                    <option value="">Select type</option>
                                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.is_half_day}
                                    onChange={e => toggleHalfDay(e.target.checked)}
                                />
                                Half Day
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Start Date</label>
                                    <input
                                        type="date" required value={form.start_date}
                                        onChange={e => setForm(prev => ({
                                            ...prev,
                                            start_date: e.target.value,
                                            end_date: prev.is_half_day ? e.target.value : prev.end_date,
                                        }))}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">End Date</label>
                                    <input
                                        type="date" required value={form.end_date} disabled={form.is_half_day}
                                        onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300 disabled:opacity-50" />
                                </div>
                            </div>
                            {form.is_half_day && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Half Day Period</label>
                                    <select
                                        value={form.half_day_period}
                                        onChange={e => setForm({ ...form, half_day_period: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                    >
                                        <option value="Morning">Morning</option>
                                        <option value="Afternoon">Afternoon</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Reason</label>
                                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Cancel
                                </button>
                                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm">
                                    <FiCheckCircle className="h-3.5 w-3.5" /> Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
