import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    FiClock, FiCheckCircle, FiXCircle, FiEdit2, FiTrash2, FiPlus,
    FiCalendar, FiFilter, FiLogIn, FiLogOut, FiUser, FiUsers,
} from 'react-icons/fi';

const STATUS_STYLES = {
    'Present': 'bg-emerald-50 text-emerald-700 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500',
    'Late':    'bg-amber-50 text-amber-800 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500',
    'Absent':  'bg-red-50 text-red-700 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500',
    'Leave':   'bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500',
    'Holiday': 'bg-purple-50 text-purple-700 border-purple-600 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500',
    'Weekend': 'bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500',
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

function notify(promise, successTitle) {
    promise.then(() => Swal.fire({ title: successTitle, icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }));
}

export default function Index({ attendances, employees, shifts, filters }) {
    const { auth, errors, flash } = usePage().props;
    const [date, setDate] = useState(filters?.date || new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [modalEmployee, setModalEmployee] = useState(null); // employee_id being marked/edited
    const [form, setForm] = useState({ status: 'Present', check_in: '', check_out: '', remarks: '' });

    const applyFilters = (nextDate = date, nextStatus = statusFilter) => {
        router.get(route('attendances.index'), { date: nextDate, status: nextStatus || undefined }, { preserveState: true });
    };

    const attendanceFor = (employeeId) => attendances.find(a => a.employee_id === employeeId);

    const openModal = (emp) => {
        const existing = attendanceFor(emp.id);
        setForm({
            status: existing?.status || 'Present',
            check_in: existing?.check_in?.substring(0, 5) || '',
            check_out: existing?.check_out?.substring(0, 5) || '',
            remarks: existing?.remarks || '',
        });
        setModalEmployee(emp);
    };

    const submitMark = (e) => {
        e.preventDefault();
        const existing = attendanceFor(modalEmployee.id);
        const payload = { ...form, employee_id: modalEmployee.id, date };

        const req = existing
            ? router.put(route('attendances.update', existing.id), payload, {
                onSuccess: () => { setModalEmployee(null); Swal.fire({ title: 'Attendance updated', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error || 'Please check the form.', icon: 'error', ...swalTheme() }),
            })
            : router.post(route('attendances.store'), payload, {
                onSuccess: () => { setModalEmployee(null); Swal.fire({ title: 'Attendance saved', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error || 'Please check the form.', icon: 'error', ...swalTheme() }),
            });
    };

    const handleDelete = (attendance) => {
        Swal.fire({
            title: 'Remove this record?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, remove it', ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('attendances.destroy', attendance.id), {
                    onSuccess: () => Swal.fire({ title: 'Removed', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme() }),
                });
            }
        });
    };

    const selfCheckIn = () => {
        router.post(route('attendances.checkIn'), {}, {
            onSuccess: () => Swal.fire({ title: 'Checked In', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }),
            onError: (errs) => Swal.fire({ title: 'Could not check in', text: errs.error, icon: 'error', ...swalTheme() }),
        });
    };

    const selfCheckOut = () => {
        router.post(route('attendances.checkOut'), {}, {
            onSuccess: () => Swal.fire({ title: 'Checked Out', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }),
            onError: (errs) => Swal.fire({ title: 'Could not check out', text: errs.error, icon: 'error', ...swalTheme() }),
        });
    };

    const filteredEmployees = statusFilter
        ? employees.filter(emp => (attendanceFor(emp.id)?.status || 'Absent') === statusFilter)
        : employees;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance</h2>}>
            <Head title="Attendance" />

            <div className="max-w-6xl mx-auto space-y-4">

                {/* Self check-in/out card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-700 text-white">
                            <FiUser className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{auth.user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Self check-in — use this if the biometric device is unavailable</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={selfCheckIn} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-sm transition-colors">
                            <FiLogIn className="h-3.5 w-3.5" /> Check In
                        </button>
                        <button onClick={selfCheckOut} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-sm transition-colors">
                            <FiLogOut className="h-3.5 w-3.5" /> Check Out
                        </button>
                    </div>
                </div>

                {/* Filters + list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        <FiUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-auto">Daily Register</h3>

                        <div className="flex items-center gap-2">
                            <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={e => { setDate(e.target.value); applyFilters(e.target.value, statusFilter); }}
                                className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-1.5 px-2 dark:text-slate-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FiFilter className="h-3.5 w-3.5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); applyFilters(date, e.target.value); }}
                                className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-1.5 px-2 dark:text-slate-300"
                            >
                                <option value="">All Statuses</option>
                                {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* টেবিল সবসময় টেবিল আকারেই থাকে; জায়গা কম পড়লে শুধু horizontal scroll হবে,
                        মোবাইলেও Action বাটন কলাম হিসেবে ডানপাশেই থাকবে, নিচে ভাঙবে না। */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="text-left px-5 py-2.5">Employee</th>
                                    <th className="text-left px-5 py-2.5">Shift</th>
                                    <th className="text-left px-5 py-2.5">Check In</th>
                                    <th className="text-left px-5 py-2.5">Check Out</th>
                                    <th className="text-left px-5 py-2.5">Status</th>
                                    <th className="text-left px-5 py-2.5">Late (min)</th>
                                    <th className="text-right px-5 py-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredEmployees.map(emp => {
                                    const a = attendanceFor(emp.id);
                                    const status = a?.status || 'Absent';
                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="px-5 py-2.5 whitespace-nowrap">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs text-slate-400">{emp.employee_id}</p>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{emp.shift?.name || '—'}</td>
                                            <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{a?.check_in?.substring(0, 5) || '—'}</td>
                                            <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{a?.check_out?.substring(0, 5) || '—'}</td>
                                            <td className="px-5 py-2.5 whitespace-nowrap">
                                                <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-sm border-l-4 ${STATUS_STYLES[status]}`}>{status}</span>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{a?.late_minutes > 0 ? a.late_minutes : '—'}</td>
                                            <td className="px-5 py-2.5 text-right whitespace-nowrap">
                                                <button onClick={() => openModal(emp)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-1.5">
                                                    <FiEdit2 className="h-3 w-3" /> {a ? 'Edit' : 'Mark'}
                                                </button>
                                                {a && (
                                                    <button onClick={() => handleDelete(a)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">
                                                        <FiTrash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredEmployees.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">No employees match this filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Manual mark / edit modal */}
            {modalEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-md">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Mark Attendance — {modalEmployee.first_name} {modalEmployee.last_name}
                            </h3>
                            <button onClick={() => setModalEmployee(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitMark} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                >
                                    {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {['Present', 'Late'].includes(form.status) && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Check In</label>
                                        <input type="time" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })}
                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Check Out</label>
                                        <input type="time" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })}
                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Remarks</label>
                                <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                                    placeholder="e.g. Forgot to punch"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalEmployee(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Cancel
                                </button>
                                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm">
                                    <FiCheckCircle className="h-3.5 w-3.5" /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
