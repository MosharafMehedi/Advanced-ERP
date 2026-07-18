import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiXCircle, FiCheckCircle, FiMapPin } from 'react-icons/fi';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

const emptyForm = { title: '', date: '', branch_id: '', remarks: '' };

export default function Index({ holidays, branches, filters }) {
    const [modalHoliday, setModalHoliday] = useState(null); // null = closed, {} = new, {...} = editing
    const [form, setForm] = useState(emptyForm);
    const [year, setYear] = useState(filters?.year || new Date().getFullYear());

    const openModal = (holiday = null) => {
        setForm(holiday ? {
            title: holiday.title,
            date: holiday.date,
            branch_id: holiday.branch_id || '',
            remarks: holiday.remarks || '',
        } : emptyForm);
        setModalHoliday(holiday || {});
    };

    const applyYearFilter = (nextYear) => {
        setYear(nextYear);
        router.get(route('holidays.index'), { year: nextYear }, { preserveState: true });
    };

    const submit = (e) => {
        e.preventDefault();
        const isEdit = modalHoliday?.id;
        const payload = { ...form, branch_id: form.branch_id || null };

        if (isEdit) {
            router.put(route('holidays.update', modalHoliday.id), payload, {
                onSuccess: () => { setModalHoliday(null); Swal.fire({ title: 'Holiday updated', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.date || Object.values(errs)[0], icon: 'error', ...swalTheme() }),
            });
        } else {
            router.post(route('holidays.store'), payload, {
                onSuccess: () => { setModalHoliday(null); Swal.fire({ title: 'Holiday added', icon: 'success', timer: 1300, showConfirmButton: false, ...swalTheme() }); },
                onError: (errs) => Swal.fire({ title: 'Failed', text: errs.date || Object.values(errs)[0], icon: 'error', ...swalTheme() }),
            });
        }
    };

    const handleDelete = (holiday) => {
        Swal.fire({
            title: `Remove "${holiday.title}"?`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, remove it', ...swalTheme(),
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('holidays.destroy', holiday.id), {
                    onSuccess: () => Swal.fire({ title: 'Removed', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme() }),
                });
            }
        });
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayName = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Holidays</h2>}>
            <Head title="Holidays" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Holiday Calendar
                        </h3>

                        <div className="flex items-center gap-2">
                            <select
                                value={year}
                                onChange={e => applyYearFilter(e.target.value)}
                                className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-1.5 px-2 dark:text-slate-300 cursor-pointer"
                            >
                                {[year - 1, year, year + 1, year + 2].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button onClick={() => openModal()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm">
                                <FiPlus className="h-3.5 w-3.5" /> Add Holiday
                            </button>
                        </div>
                    </div>

                    {/* টেবিল সবসময় টেবিল আকারেই থাকে; জায়গা কম পড়লে শুধু horizontal scroll হবে,
                        Action বাটন সবসময় ডানপাশের কলামেই থাকবে, নিচে ভাঙবে না। */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="text-left px-5 py-2.5">Date</th>
                                    <th className="text-left px-5 py-2.5">Day</th>
                                    <th className="text-left px-5 py-2.5">Title</th>
                                    <th className="text-left px-5 py-2.5">Applies To</th>
                                    <th className="text-right px-5 py-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {holidays.map(holiday => (
                                    <tr key={holiday.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatDate(holiday.date)}</td>
                                        <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{dayName(holiday.date)}</td>
                                        <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{holiday.title}</td>
                                        <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1">
                                                <FiMapPin className="h-3.5 w-3.5" />
                                                {holiday.branch ? holiday.branch.name : 'All Branches'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-right whitespace-nowrap">
                                            <button onClick={() => openModal(holiday)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-1.5">
                                                <FiEdit2 className="h-3 w-3" /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(holiday)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10">
                                                <FiTrash2 className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {holidays.length === 0 && (
                                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No holidays defined for {year}.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modalHoliday && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-sm">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{modalHoliday.id ? 'Edit Holiday' : 'Add Holiday'}</h3>
                            <button onClick={() => setModalHoliday(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Independence Day"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Date</label>
                                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Applies To</label>
                                <select
                                    value={form.branch_id}
                                    onChange={e => setForm({ ...form, branch_id: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300 cursor-pointer"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Remarks (optional)</label>
                                <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                                    placeholder="e.g. Govt. declared holiday"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalHoliday(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
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
