import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiXCircle, FiCheckCircle } from 'react-icons/fi';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

export default function Index({ leaveTypes }) {
    const [modalType, setModalType] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', days_per_year: 10, is_paid: true, carry_forward_allowed: false, max_carry_forward_days: 0 });

    const openModal = (type = null) => {
        setForm(type ? {
            name: type.name, code: type.code, days_per_year: type.days_per_year,
            is_paid: type.is_paid, carry_forward_allowed: type.carry_forward_allowed,
            max_carry_forward_days: type.max_carry_forward_days,
        } : { name: '', code: '', days_per_year: 10, is_paid: true, carry_forward_allowed: false, max_carry_forward_days: 0 });
        setModalType(type || {});
    };

    const submit = (e) => {
        e.preventDefault();
        const isEdit = modalType?.id;
        const opts = {
            onSuccess: () => { setModalType(null); Swal.fire({ title: isEdit ? 'Leave type updated' : 'Leave type created', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
            onError: (errs) => Swal.fire({ title: 'Failed', text: errs.error || Object.values(errs)[0], icon: 'error', ...swalTheme() }),
        };
        isEdit ? router.put(route('leave-types.update', modalType.id), form, opts) : router.post(route('leave-types.store'), form, opts);
    };

    const handleDelete = (type) => {
        Swal.fire({
            title: `Delete "${type.name}"?`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, delete it', ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('leave-types.destroy', type.id), {
                    onSuccess: () => Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme() }),
                    onError: (errs) => Swal.fire({ title: 'Cannot delete', text: errs.error, icon: 'error', ...swalTheme() }),
                });
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Leave Types</h2>}>
            <Head title="Leave Types" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <FiLayers className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Leave Type Definitions
                        </h3>
                        <button onClick={() => openModal()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm">
                            <FiPlus className="h-3.5 w-3.5" /> Add Type
                        </button>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-5 py-2.5">Name</th>
                                <th className="text-left px-5 py-2.5">Code</th>
                                <th className="text-left px-5 py-2.5">Days/Year</th>
                                <th className="text-left px-5 py-2.5">Paid</th>
                                <th className="text-left px-5 py-2.5">Carry Forward</th>
                                <th className="text-right px-5 py-2.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {leaveTypes.map(type => (
                                <tr key={type.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{type.name}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{type.code}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">{type.days_per_year}</td>
                                    <td className="px-5 py-2.5">{type.is_paid ? <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Paid</span> : <span className="text-red-600 dark:text-red-400 text-xs font-semibold">Unpaid</span>}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 text-xs">{type.carry_forward_allowed ? `Up to ${type.max_carry_forward_days} days` : '—'}</td>
                                    <td className="px-5 py-2.5 text-right">
                                        <button onClick={() => openModal(type)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-1.5">
                                            <FiEdit2 className="h-3 w-3" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(type)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <FiTrash2 className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {leaveTypes.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">No leave types defined yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-sm">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{modalType.id ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                            <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Name</label>
                                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Casual Leave"
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Code</label>
                                    <input type="text" required maxLength={10} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="CL"
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Days Per Year</label>
                                <input type="number" step="0.5" min="0" required value={form.days_per_year} onChange={e => setForm({ ...form, days_per_year: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input type="checkbox" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} />
                                Paid Leave
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input type="checkbox" checked={form.carry_forward_allowed} onChange={e => setForm({ ...form, carry_forward_allowed: e.target.checked })} />
                                Allow Carry Forward
                            </label>
                            {form.carry_forward_allowed && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Max Carry Forward Days</label>
                                    <input type="number" step="0.5" min="0" value={form.max_carry_forward_days} onChange={e => setForm({ ...form, max_carry_forward_days: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
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
