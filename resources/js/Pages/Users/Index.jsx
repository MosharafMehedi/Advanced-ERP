import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2"; // <--- SweetAlert2 Import korbo
import {
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiX,
    FiInbox,
    FiDownload,
    FiUsers,
} from "react-icons/fi";

const ROLE = {
    admin: "bg-red-50 text-red-700 border-l-4 border-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500",
    manager:
        "bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500",
    default:
        "bg-slate-100 text-slate-600 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500",
};

function roleChip(role) {
    const r = (role || "").toLowerCase();
    if (r.includes("admin")) return ROLE.admin;
    if (r.includes("manager") || r.includes("hr")) return ROLE.manager;
    return ROLE.default;
}

function derivePageInfo(users) {
    if (users.current_page && users.last_page) {
        return { current: users.current_page, last: users.last_page };
    }
    const numeric = users.links.filter((l) => !isNaN(Number(l.label)));
    const active = users.links.find((l) => l.active);
    return {
        current: active && !isNaN(Number(active.label)) ? Number(active.label) : null,
        last: numeric.length ? Number(numeric[numeric.length - 1].label) : null,
    };
}

export default function Index({ users, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedIds, setSelectedIds] = useState([]);
    const { current: currentPage, last: lastPage } = derivePageInfo(users);

    const triggerSearch = useCallback((searchTerm) => {
        router.get(
            route("users.index"),
            { search: searchTerm },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || "")) {
                triggerSearch(search);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [search, filters.search, triggerSearch]);

    useEffect(() => {
        setSelectedIds([]);
    }, [users.data]);

    const allOnPageSelected =
        users.data.length > 0 && users.data.every((u) => selectedIds.includes(u.id));

    const toggleAll = () => {
        setSelectedIds(allOnPageSelected ? [] : users.data.map((u) => u.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    // Custom Dark/Light theme dynamic object to keep styling consistent with UI
    const isDark = document.documentElement.classList.contains("dark");

    // Single User Delete via SweetAlert2
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this user record!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#b91c1c", // Tailwind red-700
            cancelButtonColor: "#475569",  // Tailwind slate-600
            confirmButtonText: "Yes, delete it!",
            background: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#0f172a",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("users.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: "Deleted!",
                            text: "User has been removed successfully.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                            background: isDark ? "#0f172a" : "#ffffff",
                            color: isDark ? "#f1f5f9" : "#0f172a",
                        });
                    }
                });
            }
        });
    };

    // Bulk Delete via SweetAlert2
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: `Delete ${selectedIds.length} users?`,
            text: "This batch execution will purge all selected user profiles!",
            icon: "danger",
            showCancelButton: true,
            confirmButtonColor: "#b91c1c",
            cancelButtonColor: "#475569",
            confirmButtonText: "Yes, delete batch!",
            background: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#0f172a",
        }).then((result) => {
            if (result.isConfirmed) {
                const deleteNext = (ids) => {
                    if (ids.length === 0) {
                        setSelectedIds([]);
                        Swal.fire({
                            title: "Batch Deleted!",
                            text: "All selected accounts processed successfully.",
                            icon: "success",
                            timer: 2500,
                            showConfirmButton: false,
                            background: isDark ? "#0f172a" : "#ffffff",
                            color: isDark ? "#f1f5f9" : "#0f172a",
                        });
                        return;
                    }
                    const [id, ...rest] = ids;
                    router.delete(route("users.destroy", id), {
                        preserveScroll: true,
                        preserveState: true,
                        onFinish: () => deleteNext(rest),
                    });
                };
                deleteNext(selectedIds);
            }
        });
    };

    const exportCsv = () => {
        const headers = [
            "Employee ID",
            "Name",
            "Email",
            "Phone",
            "Designation",
            "Department",
            "Branch",
            "Role",
        ];
        const rows = users.data.map((u) => [
            u.employee_id,
            u.name,
            u.email,
            u.phone,
            u.designation,
            u.department,
            u.branch,
            u.role,
        ]);
        const csv = [headers, ...rows]
            .map((row) =>
                row.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `users-page-${currentPage ?? 1}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    User Management
                </h2>
            }
        >
            <Head title="User Management" />

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
                                    Administration &nbsp;›&nbsp; Users
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    User Master List
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm px-3 py-2">
                            <span className="text-slate-400 dark:text-slate-500">Total Records</span>
                            <span className="text-slate-900 dark:text-white text-sm tabular-nums">
                                {users.total}
                            </span>
                        </div>
                    </div>

                    {/* Main panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                            <div className="relative w-full sm:w-72">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search name, email, emp ID…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 placeholder-slate-400 transition-colors"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        title="Clear search"
                                    >
                                        <FiX className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

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
                                <Link
                                    href={route("users.create")}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                                >
                                    <FiPlus className="h-3.5 w-3.5" />
                                    Add New User
                                </Link>
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
                            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
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
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                            Emp ID / Name
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                            Contact Info
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                            Dept & Designation
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                            Branch
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {users.data.map((user, idx) => {
                                        const checked = selectedIds.includes(user.id);
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`transition-colors ${
                                                    checked
                                                        ? "bg-blue-50/70 dark:bg-blue-500/10"
                                                        : idx % 2 === 1
                                                        ? "bg-slate-50/60 dark:bg-slate-900/30"
                                                        : "bg-white dark:bg-slate-900"
                                                } hover:bg-blue-50/50 dark:hover:bg-blue-500/5`}
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleOne(user.id)}
                                                        className="h-3.5 w-3.5 accent-blue-700 cursor-pointer"
                                                        aria-label={`Select ${user.name}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                    {user.photo ? (
                                                        <img
                                                            src={user.photo}
                                                            alt={user.name}
                                                            className="h-8 w-8 rounded-sm object-cover border border-slate-300 dark:border-slate-700"
                                                            onError={(e) => {
                                                                // Jodi kono karone image link broken thake, tahole jate ui crash na kore
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-white text-[13px]">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                                            {user.employee_id || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                    <div className="text-slate-700 dark:text-slate-300 text-[13px]">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                                        {user.phone || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                    <div className="text-slate-700 dark:text-slate-300 text-[13px]">
                                                        {user.designation || "N/A"}
                                                    </div>
                                                    <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
                                                        {user.department || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[13px]">
                                                    {user.branch || "N/A"}
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm ${roleChip(
                                                            user.role,
                                                        )}`}
                                                    >
                                                        {user.role || "User"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-right">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <Link
                                                            href={route("users.show", user.id)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route("users.edit", user.id)}
                                                            className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <FiEdit2 className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20">
                                                <div className="flex flex-col items-center justify-center gap-3 text-center">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                                        <FiInbox className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                                                            No matching user records found
                                                        </p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            Try a different name, email, or employee ID.
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
                        {users.links.length > 3 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Showing{" "}
                                    <span className="text-slate-800 dark:text-slate-200">{users.from || 0}</span>–
                                    <span className="text-slate-800 dark:text-slate-200">{users.to || 0}</span> of{" "}
                                    <span className="text-slate-800 dark:text-slate-200">{users.total}</span> entries
                                    {currentPage && lastPage && (
                                        <span className="text-slate-400 dark:text-slate-500">
                                            &nbsp;·&nbsp; Page {currentPage} of {lastPage}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {users.links.map((link, index) => {
                                        const isPrevious = link.label.includes("Previous");
                                        const isNext = link.label.includes("Next");

                                        return (
                                            <button
                                                key={index}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    router.get(
                                                        link.url,
                                                        { search: search },
                                                        { preserveScroll: true, preserveState: true }
                                                    )
                                                }
                                                className={`px-2.5 py-1.5 text-xs font-semibold rounded-sm border transition-all ${
                                                    link.active
                                                        ? "bg-blue-700 text-white border-blue-700"
                                                        : !link.url
                                                        ? "text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                                                        : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                }`}
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