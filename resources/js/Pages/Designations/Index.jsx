import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiSave, FiTag, FiInbox, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';

// Formal, rectangular status chips — consistent with the rest of the module.
const STATUS = {
    1: {
        label: 'Active',
        classes: 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500',
    },
    0: {
        label: 'Inactive',
        classes: 'bg-slate-100 text-slate-600 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500',
    },
    2: {
        label: 'Suspended',
        classes: 'bg-rose-50 text-rose-700 border-l-4 border-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500',
    },
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

function derivePageInfo(designations) {
    if (!Array.isArray(designations.links)) return { current: null, last: null };
    if (designations.current_page && designations.last_page) {
        return { current: designations.current_page, last: designations.last_page };
    }
    const numeric = designations.links.filter((l) => !isNaN(Number(l.label)));
    const active = designations.links.find((l) => l.active);
    return {
        current: active && !isNaN(Number(active.label)) ? Number(active.label) : null,
        last: numeric.length ? Number(numeric[numeric.length - 1].label) : null,
    };
}

export default function Index({ designations, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const hasPagination = Array.isArray(designations.links) && designations.links.length > 3;
    const { current: currentPage, last: lastPage } = derivePageInfo(designations);
    const totalCount = designations.total ?? designations.data.length;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: '',
        designation_code: '',
        title: '',
        description: '',
        status: '1',
    });

    useEffect(() => {
        setSelectedIds([]);
    }, [designations.data]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('designations.index'), { search, status }, { preserveState: true });
    };

    const allOnPageSelected = designations.data.length > 0 && designations.data.every((d) => selectedIds.includes(d.id));

    const toggleAll = () => {
        setSelectedIds(allOnPageSelected ? [] : designations.data.map((d) => d.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (designation) => {
        clearErrors();
        setEditMode(true);
        setData({
            id: designation.id,
            designation_code: designation.designation_code ?? '',
            title: designation.title ?? '',
            description: designation.description ?? '',
            status: designation.status?.toString() ?? '1',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editMode) {
            put(route('designations.update', data.id), {
                onSuccess: () => {
                    closeModal();
                    showSuccessAlert('Designation updated successfully.');
                },
                onError: () => showValidationErrorAlert(),
            });
        } else {
            post(route('designations.store'), {
                onSuccess: () => {
                    closeModal();
                    showSuccessAlert('Designation created successfully.');
                },
                onError: () => showValidationErrorAlert(),
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this designation!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('designations.destroy', id), {
                    onSuccess: () => showSuccessAlert('Designation deleted successfully.'),
                });
            }
        });
    };

    // Bulk delete — sequential, since Inertia handles one in-flight visit at a time.
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        Swal.fire({
            title: `Delete ${selectedIds.length} designation(s)?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete them!',
            ...swalTheme(),
        }).then((result) => {
            if (!result.isConfirmed) return;
            const deleteNext = (ids) => {
                if (ids.length === 0) {
                    setSelectedIds([]);
                    showSuccessAlert('Selected designations were deleted.');
                    return;
                }
                const [id, ...rest] = ids;
                router.delete(route('designations.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => deleteNext(rest),
                });
            };
            deleteNext(selectedIds);
        });
    };

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            ...swalTheme(),
        });
    };

    const showValidationErrorAlert = () => {
        Swal.fire({
            title: 'Error!',
            text: 'Please fix the validation errors in the form.',
            icon: 'error',
            confirmButtonColor: '#1d4ed8',
            ...swalTheme(),
        });
    };

    const exportCsv = () => {
        const headers = ['Designation Code', 'Title', 'Description', 'Status'];
        const rows = designations.data.map((d) => [
            d.designation_code,
            d.title,
            d.description || '',
            STATUS[d.status]?.label || '',
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `designations-page-${currentPage ?? 1}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Shared field styles — matches the module's Create/Edit form pages.
    const inputStyle = "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors";
    const labelStyle = "block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2";
    const errorStyle = "text-red-600 dark:text-red-400 text-xs mt-1 font-medium";

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Designation Management</h2>}
        >
            <Head title="Designations" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-7xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiTag className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Designations
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Designation Master List
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm px-3 py-2">
                            <span className="text-slate-400 dark:text-slate-500">Total Records</span>
                            <span className="text-slate-900 dark:text-white text-sm tabular-nums">{totalCount}</span>
                        </div>
                    </div>

                    {/* Main panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search code or title…"
                                        className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 placeholder-slate-400 transition-colors"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            title="Clear search"
                                        >
                                            <FiX className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                    <option value="2">Suspended</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-sm transition-colors"
                                >
                                    Filter
                                </button>
                            </form>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={exportCsv}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                                    title="Export current page as CSV"
                                >
                                    <FiDownload className="h-3.5 w-3.5" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                                >
                                    <FiPlus className="h-3.5 w-3.5" />
                                    Add Designation
                                </button>
                            </div>
                        </div>

                        {/* Bulk action bar */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20">
                                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                                    {selectedIds.length} selected
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIds([])}
                                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors"
                                    >
                                        <FiTrash2 className="h-3.5 w-3.5" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Data grid */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                                <thead className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wide font-bold bg-slate-100 dark:bg-slate-800/60 border-b-2 border-slate-300 dark:border-slate-700">
                                    <tr>
                                        <th className="w-10 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={allOnPageSelected}
                                                onChange={toggleAll}
                                                className="h-3.5 w-3.5 accent-blue-700 cursor-pointer"
                                                aria-label="Select all on this page"
                                            />
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Designation Code</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Title</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {designations.data.length > 0 ? (
                                        designations.data.map((row, idx) => {
                                            const checked = selectedIds.includes(row.id);
                                            const st = STATUS[row.status] || STATUS[0];
                                            return (
                                                <tr
                                                    key={row.id}
                                                    className={`transition-colors ${
                                                        checked
                                                            ? 'bg-blue-50/70 dark:bg-blue-500/10'
                                                            : idx % 2 === 1
                                                            ? 'bg-slate-50/60 dark:bg-slate-900/30'
                                                            : 'bg-white dark:bg-slate-900'
                                                    } hover:bg-blue-50/50 dark:hover:bg-blue-500/5`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleOne(row.id)}
                                                            className="h-3.5 w-3.5 accent-blue-700 cursor-pointer"
                                                            aria-label={`Select ${row.title}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 font-mono font-bold text-blue-700 dark:text-blue-400 text-[13px]">
                                                        {row.designation_code}
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-200 text-[13px]">
                                                        {row.title}
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[13px] max-w-xs truncate">
                                                        {row.description || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${st.classes}`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-right">
                                                        <div className="flex justify-end items-center gap-1">
                                                            <button
                                                                onClick={() => openEditModal(row)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FiEdit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(row.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20">
                                                <div className="flex flex-col items-center justify-center gap-3 text-center">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                                        <FiInbox className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                                                            No designations found
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            Try a different search term or status filter.
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {hasPagination && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Showing <span className="text-slate-800 dark:text-slate-200">{designations.from || 0}</span>–
                                    <span className="text-slate-800 dark:text-slate-200">{designations.to || 0}</span> of{' '}
                                    <span className="text-slate-800 dark:text-slate-200">{designations.total}</span> entries
                                    {currentPage && lastPage && (
                                        <span className="text-slate-400 dark:text-slate-500"> &nbsp;·&nbsp; Page {currentPage} of {lastPage}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {designations.links.map((link, index) => {
                                        const isPrevious = link.label.includes('Previous');
                                        const isNext = link.label.includes('Next');

                                        return (
                                            <button
                                                key={index}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    router.get(
                                                        link.url,
                                                        { search, status },
                                                        { preserveState: true, preserveScroll: true },
                                                    )
                                                }
                                                className={`min-w-[30px] h-7 px-2 flex items-center justify-center text-xs font-semibold rounded-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 ${
                                                    link.active
                                                        ? 'bg-blue-700 text-white border-blue-700'
                                                        : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-950' : ''}`}
                                            >
                                                {isPrevious ? (
                                                    <FiChevronLeft className="h-3.5 w-3.5" />
                                                ) : isNext ? (
                                                    <FiChevronRight className="h-3.5 w-3.5" />
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================== CREATE / EDIT MODAL ==================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                {editMode ? 'Edit Designation' : 'Create New Designation'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm transition-colors"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className={labelStyle}>Designation Code *</label>
                                <input
                                    type="text"
                                    value={data.designation_code}
                                    onChange={(e) => setData('designation_code', e.target.value.toUpperCase())}
                                    className={`${inputStyle} font-mono uppercase`}
                                    placeholder="e.g., DES-AVP"
                                />
                                {errors.designation_code && <div className={errorStyle}>{errors.designation_code}</div>}
                            </div>

                            <div>
                                <label className={labelStyle}>Title *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={inputStyle}
                                    placeholder="e.g., Assistant Vice President"
                                />
                                {errors.title && <div className={errorStyle}>{errors.title}</div>}
                            </div>

                            <div>
                                <label className={labelStyle}>Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className={`${inputStyle} resize-none`}
                                    placeholder="Brief description of the role..."
                                />
                                {errors.description && <div className={errorStyle}>{errors.description}</div>}
                            </div>

                            <div>
                                <label className={labelStyle}>Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={`${inputStyle} cursor-pointer`}
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                    <option value="2">Suspended</option>
                                </select>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FiX className="h-4 w-4" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="h-4 w-4" /> {editMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
