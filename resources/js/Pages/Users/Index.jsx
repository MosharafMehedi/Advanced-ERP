import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import {
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
} from "react-icons/fi";

export default function Index({ users, filters }) {
    const [search, setSearch] = useState(filters.search || "");

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

    // ডিলিট হ্যান্ডেলার
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(route("users.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    User Masterlist
                </h2>
            }
        >
            <Head title="User Management" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/60 shadow-xs rounded-2xl p-5 sm:p-6">
                {/* DataTable Top Control Center */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Quick Search by Name, Email, Emp ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-slate-200 placeholder-slate-400 font-medium transition-all"
                        />
                        <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    </div>

                    <Link
                        href={route("users.create")}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-sm shadow-indigo-500/10"
                    >
                        <FiPlus className="h-4 w-4" />
                        Add New User
                    </Link>
                </div>

                {/* Datatable Frame */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/70">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-bold">Emp ID / Name</th>
                                <th className="px-6 py-4 font-bold">Contact Info</th>
                                <th className="px-6 py-4 font-bold">Dept & Designation</th>
                                <th className="px-6 py-4 font-bold">Branch</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Photo / Avatar Section */}
                                            {user.photo_path || user.avatar ? (
                                                <img
                                                    src={user.photo_path || user.avatar}
                                                    alt={user.name}
                                                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                                                />
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200/20 dark:border-indigo-500/30">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                            
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white text-[14px]">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                    {user.employee_id || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-800 dark:text-slate-300 font-medium text-[13px]">
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {user.phone || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-800 dark:text-slate-300 font-medium text-[13px]">
                                            {user.designation || "N/A"}
                                        </div>
                                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase mt-0.5">
                                            {user.department || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-[13px] font-medium">
                                        {user.branch || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-500/20 uppercase tracking-wider">
                                            {user.role || "User"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-1.5">
                                            {/* View Details Button */}
                                            <Link
                                                href={route("users.show", user.id)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-3xs"
                                                title="View Details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </Link>

                                            {/* Edit Button */}
                                            <Link
                                                href={route("users.edit", user.id)}
                                                className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-3xs"
                                                title="Edit User"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-3xs"
                                                title="Delete User"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-16 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-transparent"
                                    >
                                        No matching user records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* DataTable Premium Pagination Control */}
                {users.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        {/* Info Text */}
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Showing <span className="text-slate-700 dark:text-slate-300">{users.from || 0}</span> to <span className="text-slate-700 dark:text-slate-300">{users.to || 0}</span> of{" "}
                            <span className="text-slate-700 dark:text-slate-300">{users.total}</span> Entries
                        </div>

                        {/* Pagination Links */}
                        <div className="flex items-center gap-1.5">
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
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        className={`min-w-[34px] h-8 flex items-center justify-center text-xs font-bold rounded-xl border transition-all ${
                                            link.active
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/10"
                                                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        } ${!link.url ? "opacity-35 cursor-not-allowed" : ""}`}
                                    >
                                        {isPrevious ? (
                                            <FiChevronLeft className="h-4 w-4" />
                                        ) : isNext ? (
                                            <FiChevronRight className="h-4 w-4" />
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}