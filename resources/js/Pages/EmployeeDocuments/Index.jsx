import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    FiFileText, FiUpload, FiUsers, FiChevronRight, FiXCircle, FiCheckCircle,
} from 'react-icons/fi';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return { background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' };
}

const DOC_TYPES = ['NID', 'Passport', 'Certificate', 'Resume', 'Contract', 'Other'];

export default function Index({ employees, allEmployees }) {
    const [showUpload, setShowUpload] = useState(false);
    const [form, setForm] = useState({ employee_id: '', document_type: '', title: '', expiry_date: '', notes: '', file: null });
    const [uploading, setUploading] = useState(false);

    const submitUpload = (e) => {
        e.preventDefault();
        if (!form.file) {
            Swal.fire({ title: 'Please select a file', icon: 'warning', ...swalTheme() });
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => value !== null && data.append(key, value));

        setUploading(true);
        router.post(route('employee-documents.store'), data, {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                setForm({ employee_id: '', document_type: '', title: '', expiry_date: '', notes: '', file: null });
                Swal.fire({ title: 'Document uploaded', icon: 'success', timer: 1400, showConfirmButton: false, ...swalTheme() });
            },
            onError: (errs) => Swal.fire({ title: 'Upload failed', text: Object.values(errs)[0], icon: 'error', ...swalTheme() }),
            onFinish: () => setUploading(false),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Documents</h2>}>
            <Head title="Employee Documents" />

            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-700 text-white">
                            <FiFileText className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                Administration &nbsp;›&nbsp; HRM &nbsp;›&nbsp; Documents
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Document Repository</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm"
                    >
                        <FiUpload className="h-3.5 w-3.5" /> Upload Document
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-5 py-2.5">Employee ID</th>
                                <th className="text-left px-5 py-2.5">Employee Name</th>
                                <th className="text-left px-5 py-2.5">Documents</th>
                                <th className="text-right px-5 py-2.5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employees.data.length > 0 ? employees.data.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{emp.employee_id || `EMP-${emp.id}`}</td>
                                    <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                        <FiUsers className="h-3.5 w-3.5 text-slate-400" /> {emp.full_name}
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-sm border-l-4 bg-blue-50 text-blue-700 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500">
                                            {emp.documents_count} Files
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                        <Link
                                            href={route('employee-documents.show', emp.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-sm"
                                        >
                                            View <FiChevronRight className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">No documents found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-md">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Upload Document</h3>
                            <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitUpload} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Employee</label>
                                <select required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300">
                                    <option value="">Select employee</option>
                                    {allEmployees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id_number || `EMP-${e.id}`})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Document Type</label>
                                    <select required value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300">
                                        <option value="">Select type</option>
                                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Expiry Date</label>
                                    <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. NID Front Side"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">File (PDF/JPG/PNG/DOC, max 5MB)</label>
                                <input type="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                    className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Notes</label>
                                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                    Cancel
                                </button>
                                <button type="submit" disabled={uploading} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm disabled:opacity-50">
                                    <FiCheckCircle className="h-3.5 w-3.5" /> {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
