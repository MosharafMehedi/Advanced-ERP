import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FiClock, FiPlus, FiEdit2, FiTrash2, FiXCircle, FiCheckCircle, FiUsers } from 'react-icons/fi';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

export default function Index({ shifts }) {
    const [modalShift, setModalShift] = useState(null); // null = closed, {} = new, {...} = editing
    const [form, setForm] = useState({ name: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15 });

    const openModal = (shift = null) => {
        setForm(shift ? {
            name: shift.name,
            start_time: shift.start_time?.substring(0, 5),
            end_time: shift.end_time?.substring(0, 5),
            grace_minutes: shift.grace_minutes,
        } : { name: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15 });
        setModalShift(shift || {});
    };

    const submit = (e) => {
        e.preventDefault();
        const isEdit = modalShift?.id;
        const action = isEdit
            ? router.put(route('shifts.update', modalShift.id), form, {
                onSuccess: () => { setModalShift(null); Swal.fire({ title: 'Shift updated', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error || Object.values(errs)[0], icon: 'error', ...swalTheme() }),
            })
            : router.post(route('shifts.store'), form, {
                onSuccess: () => { setModalShift(null); Swal.fire({ title: 'Shift created', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error || Object.values(errs)[0], icon: 'error', ...swalTheme() }),
            });
    };

    const handleDelete = (shift) => {
        Swal.fire({
            title: `Delete "${shift.name}"?`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, delete it', ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('shifts.destroy', shift.id), {
                    onSuccess: () => Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme() }),
                    onError: (errs) => Swal.fire({ title: 'Cannot delete', text: errs.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Shifts</h2>}>
            <Head title="Shifts" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <FiClock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Shift Definitions
                        </h3>
                        <button onClick={() => openModal()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm">
                            <FiPlus className="h-3.5 w-3.5" /> Add Shift
                        </button>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-5 py-2.5">Name</th>
                                <th className="text-left px-5 py-2.5">Start</th>
                                <th className="text-left px-5 py-2.5">End</th>
                                <th className="text-left px-5 py-2.5">Grace</th>
                                <th className="text-left px-5 py-2.5">Employees</th>
                                <th className="text-right px-5 py-2.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {shifts.map(shift => (
                                <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{shift.name}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{shift.start_time?.substring(0, 5)}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{shift.end_time?.substring(0, 5)}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{shift.grace_minutes} min</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <FiUsers className="h-3.5 w-3.5" /> {shift.employees_count ?? 0}
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                        <button onClick={() => openModal(shift)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-1.5">
                                            <FiEdit2 className="h-3 w-3" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(shift)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <FiTrash2 className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {shifts.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">No shifts defined yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalShift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-sm">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{modalShift.id ? 'Edit Shift' : 'Add Shift'}</h3>
                            <button onClick={() => setModalShift(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Shift Name</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. General Shift"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Start Time</label>
                                    <input type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">End Time</label>
                                    <input type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Grace Period (minutes)</label>
                                <input type="number" min="0" max="120" value={form.grace_minutes} onChange={e => setForm({ ...form, grace_minutes: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalShift(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
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
