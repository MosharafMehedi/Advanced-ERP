import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser, FiBriefcase, FiUsers, FiX, FiInbox, FiDownload, FiChevronLeft, FiChevronRight,FiEye } from 'react-icons/fi';
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
        label: 'Resigned',
        classes: 'bg-amber-50 text-amber-800 border-l-4 border-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500',
    },
    3: {
        label: 'Terminated',
        classes: 'bg-red-50 text-red-700 border-l-4 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500',
    },
};

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

function derivePageInfo(employees) {
    if (!Array.isArray(employees.links)) return { current: null, last: null };
    if (employees.current_page && employees.last_page) {
        return { current: employees.current_page, last: employees.last_page };
    }
    const numeric = employees.links.filter((l) => !isNaN(Number(l.label)));
    const active = employees.links.find((l) => l.active);
    return {
        current: active && !isNaN(Number(active.label)) ? Number(active.label) : null,
        last: numeric.length ? Number(numeric[numeric.length - 1].label) : null,
    };
}

export default function Index({ employees, filters, branches, departments }) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [deptId, setDeptId] = useState(filters.department_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const hasPagination = Array.isArray(employees.links) && employees.links.length > 3;
    const { current: currentPage, last: lastPage } = derivePageInfo(employees);
    const totalCount = employees.total ?? employees.data.length;

    useEffect(() => {
        setSelectedIds([]);
    }, [employees.data]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('employees.index'), { search, branch_id: branchId, department_id: deptId, status }, { preserveState: true });
    };

    const allOnPageSelected = employees.data.length > 0 && employees.data.every((e) => selectedIds.includes(e.id));

    const toggleAll = () => {
        setSelectedIds(allOnPageSelected ? [] : employees.data.map((e) => e.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this employee profile!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            ...swalTheme(),
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('employees.destroy', id), {
                    onSuccess: () =>
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Employee soft-deleted.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            ...swalTheme(),
                        }),
                });
            }
        });
    };

    // Bulk delete — sequential, since Inertia handles one in-flight visit at a time.
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        Swal.fire({
            title: `Delete ${selectedIds.length} employee profile(s)?`,
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
                        text: 'Selected employee profiles were soft-deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalTheme(),
                    });
                    return;
                }
                const [id, ...rest] = ids;
                router.delete(route('employees.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => deleteNext(rest),
                });
            };
            deleteNext(selectedIds);
        });
    };

    const exportCsv = () => {
        const headers = ['Employee ID', 'Name', 'Designation', 'Department', 'Branch', 'Email', 'Phone', 'Status'];
        const rows = employees.data.map((emp) => [
            emp.employee_id,
            emp.full_name,
            emp.designation?.title || '',
            emp.department?.name || '',
            emp.branch?.name || '',
            emp.email || '',
            emp.phone || '',
            STATUS[emp.status]?.label || '',
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `employees-page-${currentPage ?? 1}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Management</h2>}
        >
            <Head title="Employees" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-7xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiUsers className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Employees
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Employee Profiles
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
                                        placeholder="Name, ID, Email, Phone…"
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
                                    value={branchId}
                                    onChange={e => setBranchId(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <select
                                    value={deptId}
                                    onChange={e => setDeptId(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                    <option value="2">Resigned</option>
                                    <option value="3">Terminated</option>
                                </select>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-sm transition-colors">
                                        Filter
                                    </button>
                                    <Link
                                        href={route('employees.create')}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors"
                                    >
                                        <FiPlus className="h-3.5 w-3.5" /> Add
                                    </Link>
                                </div>
                            </form>

                            <div className="flex justify-end mt-2">
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
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Employee Info</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Official Specs</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Contact</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {employees.data.length > 0 ? (
                                        employees.data.map((emp, idx) => {
                                            const checked = selectedIds.includes(emp.id);
                                            const st = STATUS[emp.status] || STATUS[0];
                                            return (
                                                <tr
                                                    key={emp.id}
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
                                                            onChange={() => toggleOne(emp.id)}
                                                            className="h-3.5 w-3.5 accent-blue-700 cursor-pointer"
                                                            aria-label={`Select ${emp.full_name}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-3">
                                                            {emp.profile_photo ? (
                                                                <img
                                                                    src={`/storage/${emp.profile_photo}`}
                                                                    className="w-8 h-8 rounded-sm object-cover border border-slate-300 dark:border-slate-700"
                                                                    alt={emp.full_name}
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-sm bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
                                                                    <FiUser className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[13px]">{emp.full_name}</div>
                                                                <div className="text-[11px] font-mono text-blue-700 dark:text-blue-400 font-bold">{emp.employee_id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-300 text-[13px]">{emp.designation?.title || 'No Designation'}</div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <FiBriefcase className="w-3 h-3" />
                                                            {emp.department?.name || '—'} | {emp.branch?.name || '—'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <div className="text-slate-700 dark:text-slate-300 text-[13px]">{emp.email || '—'}</div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{emp.phone || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                        <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${st.classes}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-right">
                                                        <div className="flex justify-end items-center gap-1">
                                                            <Link
                                                                href={route('employees.edit', emp.id)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="Edit Profile"
                                                            >
                                                                <FiEdit className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('employees.show', emp.id)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(emp.id)}
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
                                                            No employee profiles found
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            Try a different search term or filter.
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
                                    Showing <span className="text-slate-800 dark:text-slate-200">{employees.from || 0}</span>–
                                    <span className="text-slate-800 dark:text-slate-200">{employees.to || 0}</span> of{' '}
                                    <span className="text-slate-800 dark:text-slate-200">{employees.total}</span> entries
                                    {currentPage && lastPage && (
                                        <span className="text-slate-400 dark:text-slate-500"> &nbsp;·&nbsp; Page {currentPage} of {lastPage}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {employees.links.map((link, index) => {
                                        const isPrevious = link.label.includes('Previous');
                                        const isNext = link.label.includes('Next');

                                        return (
                                            <button
                                                key={index}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    router.get(
                                                        link.url,
                                                        { search, branch_id: branchId, department_id: deptId, status },
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
