import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiBriefcase, 
    FiUsers, FiX, FiInbox, FiDownload, FiChevronLeft, FiChevronRight,
    FiEye, FiCheckCircle, FiDollarSign, FiCalendar, FiFileText,
    FiSettings, FiPrinter
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';

// Status chip classes — matching employee module style
const STATUS_STYLES = {
    'Draft': {
        label: 'Draft',
        classes: 'bg-slate-100 text-slate-600 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500'
    },
    'Generated': {
        label: 'Generated',
        classes: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500'
    },
    'Approved': {
        label: 'Approved',
        classes: 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500'
    },
    'Paid': {
        label: 'Paid',
        classes: 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500'
    },
    'Cancelled': {
        label: 'Cancelled',
        classes: 'bg-red-50 text-red-700 border-l-4 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500'
    }
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

function derivePageInfo(payrolls) {
    if (!Array.isArray(payrolls.links)) return { current: null, last: null };
    if (payrolls.current_page && payrolls.last_page) {
        return { current: payrolls.current_page, last: payrolls.last_page };
    }
    const numeric = payrolls.links.filter((l) => !isNaN(Number(l.label)));
    const active = payrolls.links.find((l) => l.active);
    return {
        current: active && !isNaN(Number(active.label)) ? Number(active.label) : null,
        last: numeric.length ? Number(numeric[numeric.length - 1].label) : null,
    };
}

export default function Index({ payrolls, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || '');
    const [month, setMonth] = useState(filters.month || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const hasPagination = Array.isArray(payrolls.links) && payrolls.links.length > 3;
    const { current: currentPage, last: lastPage } = derivePageInfo(payrolls);
    const totalCount = payrolls.total ?? payrolls.data.length;

    useEffect(() => {
        setSelectedIds([]);
    }, [payrolls.data]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('payrolls.index'), { 
            search, 
            year, 
            month, 
            status 
        }, { preserveState: true });
    };

    const allOnPageSelected = payrolls.data.length > 0 && payrolls.data.every((p) => selectedIds.includes(p.id));

    const toggleAll = () => {
        setSelectedIds(allOnPageSelected ? [] : payrolls.data.map((p) => p.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleApprove = (id) => {
        Swal.fire({
            title: 'Approve Payroll?',
            text: "This will mark the salary slip as approved.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, approve it!',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('payrolls.update', id), { action: 'approve' }, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Approved!',
                            text: 'Salary slip has been approved.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            ...swalTheme(),
                        });
                    }
                });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this salary slip!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('payrolls.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Salary slip deleted successfully.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            ...swalTheme(),
                        });
                    }
                });
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        Swal.fire({
            title: `Delete ${selectedIds.length} salary slip(s)?`,
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
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Selected salary slips were deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalTheme(),
                    });
                    return;
                }
                const [id, ...rest] = ids;
                router.delete(route('payrolls.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => deleteNext(rest),
                });
            };
            deleteNext(selectedIds);
        });
    };

    const exportCsv = () => {
        const headers = ['Employee', 'Employee ID', 'Period', 'Gross Salary', 'Deductions', 'Net Payable', 'Status'];
        const rows = payrolls.data.map((p) => [
            `${p.employee?.first_name || ''} ${p.employee?.last_name || ''}`,
            p.employee?.employee_id || '',
            `${new Date(p.year, p.month - 1).toLocaleString('default', { month: 'short' })}, ${p.year}`,
            p.gross_salary || 0,
            p.total_deductions || 0,
            p.net_payable || 0,
            p.status || '',
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payrolls-page-${currentPage ?? 1}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getMonthName = (monthNum) => {
        if (!monthNum) return '—';
        return new Date(2000, parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Payroll Management</h2>}
        >
            <Head title="Payroll" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-7xl">
                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600 rounded-sm text-sm">
                            {flash.success}
                        </div>
                    )}

                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiDollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Payroll
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Salary Management
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
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Employee name, ID…"
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
                                
                                <input
                                    type="number"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    placeholder="Year (e.g. 2026)"
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 placeholder-slate-400"
                                />
                                
                                <select
                                    value={month}
                                    onChange={e => setMonth(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Months</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{getMonthName(m)}</option>
                                    ))}
                                </select>
                                
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Status</option>
                                    <option value="Generated">Generated</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Paid">Paid</option>
                                </select>
                                
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-sm transition-colors">
                                        Filter
                                    </button>
                                    <Link
                                        href={route('payrolls.create')}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors"
                                    >
                                        <FiPlus className="h-3.5 w-3.5" /> Generate
                                    </Link>
                                </div>
                            </form>

                            <div className="flex justify-end mt-2 gap-2">
                                <Link
                                    href={route('payrolls.edit', 0)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FiSettings className="h-3.5 w-3.5" />
                                    Salary Structure
                                </Link>
                                <button
                                    type="button"
                                    onClick={exportCsv}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Export current page as CSV"
                                >
                                    <FiDownload className="h-3.5 w-3.5" />
                                    Export CSV
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
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Employee</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Period</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Salary Details</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Net Payable</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {payrolls.data.length > 0 ? (
                                        payrolls.data.map((p, idx) => {
                                            const checked = selectedIds.includes(p.id);
                                            const statusStyle = STATUS_STYLES[p.status] || STATUS_STYLES['Generated'];
                                            return (
                                                <tr
                                                    key={p.id}
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
                                                            onChange={() => toggleOne(p.id)}
                                                            className="h-3.5 w-3.5 accent-blue-700 cursor-pointer"
                                                            aria-label={`Select payroll for ${p.employee?.first_name}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-3">
                                                            {p.employee?.profile_photo ? (
                                                                <img
                                                                    src={`/storage/${p.employee.profile_photo}`}
                                                                    className="w-8 h-8 rounded-sm object-cover border border-slate-300 dark:border-slate-700"
                                                                    alt={`${p.employee.first_name} ${p.employee.last_name}`}
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-sm bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
                                                                    <FiUser className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[13px]">
                                                                    {p.employee?.first_name} {p.employee?.last_name}
                                                                </div>
                                                                <div className="text-[11px] font-mono text-blue-700 dark:text-blue-400 font-bold">
                                                                    {p.employee?.employee_id || '—'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                            <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="font-medium">
                                                                {getMonthName(p.month)}, {p.year}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="text-slate-700 dark:text-slate-300 text-[13px]">
                                                            Gross: <span className="font-semibold">{formatCurrency(p.gross_salary)}</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            Deductions: {formatCurrency(p.total_deduction || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="font-bold text-blue-700 dark:text-blue-400 text-[15px]">
                                                            {formatCurrency(p.net_payable)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${statusStyle.classes}`}>
                                                            {statusStyle.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-right">
                                                        <div className="flex justify-end items-center gap-1">
                                                            <Link
                                                                href={route('payrolls.show', p.id)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="View Salary Slip"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </Link>
                                                            {p.status === 'Generated' && (
                                                                <button
                                                                    onClick={() => handleApprove(p.id)}
                                                                    className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <FiCheckCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => window.print()}
                                                                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="Print"
                                                            >
                                                                <FiPrinter className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20">
                                                <div className="flex flex-col items-center justify-center gap-3 text-center">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                                        <FiInbox className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                                                            No salary records found
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            Try adjusting your filters or generate a new salary slip.
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
                                    Showing <span className="text-slate-800 dark:text-slate-200">{payrolls.from || 0}</span>–
                                    <span className="text-slate-800 dark:text-slate-200">{payrolls.to || 0}</span> of{' '}
                                    <span className="text-slate-800 dark:text-slate-200">{payrolls.total}</span> entries
                                    {currentPage && lastPage && (
                                        <span className="text-slate-400 dark:text-slate-500"> &nbsp;·&nbsp; Page {currentPage} of {lastPage}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {payrolls.links.map((link, index) => {
                                        const isPrevious = link.label.includes('Previous');
                                        const isNext = link.label.includes('Next');

                                        return (
                                            <button
                                                key={index}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    router.get(
                                                        link.url,
                                                        { search, year, month, status },
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
        </AuthenticatedLayout>
    );
}