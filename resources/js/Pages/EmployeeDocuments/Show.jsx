import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
    FiArrowLeft,
    FiDownload,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiXCircle,
    FiCheckCircle,
    FiFileText,
    FiPaperclip,
    FiUpload,
} from "react-icons/fi";

const STATUS_STYLES = {
    Valid: "bg-emerald-50 text-emerald-700 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500",
    Expired:
        "bg-red-50 text-red-700 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500",
    Pending_Verification:
        "bg-amber-50 text-amber-800 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500",
};

const DOC_TYPES = [
    "NID",
    "Passport",
    "Certificate",
    "Resume",
    "Contract",
    "Other",
];

function swalTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    return {
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f1f5f9" : "#0f172a",
    };
}

export default function Show({ employee }) {
    const [editingDoc, setEditingDoc] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        document_type: "",
        title: "",
        expiry_date: "",
        notes: "",
        file: null,
    });
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        document_type: "",
        title: "",
        expiry_date: "",
        status: "Valid",
        notes: "",
        file: null,
    });
    const [saving, setSaving] = useState(false);

    const openEdit = (doc) => {
        setForm({
            document_type: doc.document_type,
            title: doc.title,
            expiry_date: doc.expiry_date || "",
            status: doc.status,
            notes: doc.notes || "",
            file: null,
        });
        setEditingDoc(doc);
    };

    const submitUpload = (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            Swal.fire({ title: "Please select a file", icon: "warning", ...swalTheme() });
            return;
        }

        const data = new FormData();
        data.append("employee_id", employee.id);
        Object.entries(uploadForm).forEach(
            ([key, value]) => value !== null && data.append(key, value),
        );

        setUploading(true);
        router.post(route("employee-documents.store"), data, {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                setUploadForm({ document_type: "", title: "", expiry_date: "", notes: "", file: null });
                Swal.fire({
                    title: "Document uploaded",
                    icon: "success",
                    timer: 1400,
                    showConfirmButton: false,
                    ...swalTheme(),
                });
            },
            onError: (errs) =>
                Swal.fire({
                    title: "Upload failed",
                    text: Object.values(errs)[0],
                    icon: "error",
                    ...swalTheme(),
                }),
            onFinish: () => setUploading(false),
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(
            ([key, value]) => value !== null && data.append(key, value),
        );
        data.append("_method", "PUT"); // Inertia + file upload needs method spoofing

        setSaving(true);
        router.post(route("employee-documents.update", editingDoc.id), data, {
            forceFormData: true,
            onSuccess: () => {
                setEditingDoc(null);
                Swal.fire({
                    title: "Document updated",
                    icon: "success",
                    timer: 1300,
                    showConfirmButton: false,
                    ...swalTheme(),
                });
            },
            onError: (errs) =>
                Swal.fire({
                    title: "Update failed",
                    text: Object.values(errs)[0],
                    icon: "error",
                    ...swalTheme(),
                }),
            onFinish: () => setSaving(false),
        });
    };

    const handleDelete = (doc) => {
        Swal.fire({
            title: "Delete this document?",
            text: `"${doc.title}" will be permanently removed.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it",
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("employee-documents.destroy", doc.id), {
                    onSuccess: () =>
                        Swal.fire({
                            title: "Deleted",
                            icon: "success",
                            timer: 1300,
                            showConfirmButton: false,
                            ...swalTheme(),
                        }),
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Employee Documents
                </h2>
            }
        >
            <Head title={`${employee.full_name} · Documents`} />

            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                            <FiFileText className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                Administration &nbsp;›&nbsp; HRM &nbsp;›&nbsp;
                                Documents
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {employee.full_name}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                ID: {employee.employee_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowUpload(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm"
                        >
                            <FiUpload className="h-3.5 w-3.5" /> Upload Document
                        </button>
                        <Link
                            href={route("employee-documents.index")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" /> Back to List
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-5 py-2.5">
                                    Doc Type
                                </th>
                                <th className="text-left px-5 py-2.5">Title</th>
                                <th className="text-left px-5 py-2.5">
                                    Format
                                </th>
                                <th className="text-left px-5 py-2.5">
                                    Expiry Date
                                </th>
                                <th className="text-left px-5 py-2.5">
                                    Status
                                </th>
                                <th className="text-right px-5 py-2.5">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employee.documents.length > 0 ? (
                                employee.documents.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                                            {doc.document_type}
                                        </td>
                                        <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">
                                            {doc.title}
                                        </td>
                                        <td className="px-5 py-2.5">
                                            <span className="uppercase text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-sm">
                                                {doc.file_type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-slate-600 dark:text-slate-400">
                                            {doc.expiry_date || "N/A"}
                                        </td>
                                        <td className="px-5 py-2.5">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-sm border-l-4 ${STATUS_STYLES[doc.status] || STATUS_STYLES["Pending_Verification"]}`}
                                            >
                                                {doc.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                            <a
                                                href={route(
                                                    "employee-documents.view",
                                                    doc.id,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <FiEye className="h-3 w-3" />{" "}
                                            </a>
                                            <a
                                                href={route(
                                                    "employee-documents.download",
                                                    doc.id,
                                                )}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm"
                                            >
                                                <FiDownload className="h-3 w-3" />{" "}
                                            </a>
                                            <button
                                                onClick={() => openEdit(doc)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 rounded-sm hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                            >
                                                <FiEdit2 className="h-3 w-3" />{" "}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(doc)
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10"
                                            >
                                                <FiTrash2 className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-8 text-center text-slate-400 text-sm"
                                    >
                                        No individual documents found for this
                                        employee.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-md">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Upload Document — {employee.full_name}
                            </h3>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitUpload} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Document Type
                                    </label>
                                    <select
                                        required
                                        value={uploadForm.document_type}
                                        onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                    >
                                        <option value="">Select type</option>
                                        {DOC_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={uploadForm.expiry_date}
                                        onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="e.g. NID Front Side"
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    File (PDF/JPG/PNG/DOC, max 5MB)
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={uploadForm.notes}
                                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm disabled:opacity-50"
                                >
                                    <FiCheckCircle className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-lg w-full max-w-md">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Edit Document
                            </h3>
                            <button
                                onClick={() => setEditingDoc(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <FiXCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitEdit} className="p-5 space-y-4">
                            {/* Current file — name + a View link, so it's clear what's already attached */}
                            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-3 py-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FiPaperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                        {editingDoc.title}.{editingDoc.file_type}
                                    </span>
                                </div>
                                <a
                                    href={route("employee-documents.view", editingDoc.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                                >
                                    <FiEye className="h-3 w-3" /> View
                                </a>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Document Type
                                    </label>
                                    <select
                                        required
                                        value={form.document_type}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                document_type: e.target.value,
                                            })
                                        }
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                    >
                                        {DOC_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        required
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value,
                                            })
                                        }
                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                    >
                                        <option value="Valid">Valid</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Pending_Verification">
                                            Pending Verification
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={form.expiry_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            expiry_date: e.target.value,
                                        })
                                    }
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Replace File (optional — leave empty to keep the current one)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            file: e.target.files[0],
                                        })
                                    }
                                    className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
                                />
                                {form.file && (
                                    <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                                        New file selected: {form.file.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 dark:text-slate-300"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingDoc(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-sm disabled:opacity-50"
                                >
                                    <FiCheckCircle className="h-3.5 w-3.5" />{" "}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
