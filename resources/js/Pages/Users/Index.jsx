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

    // Debounce Search Functionality: টাইপ করা শেষ হওয়ার ৪০০ms পর অটোমেটিক সার্ভারে রিকোয়েস্ট যাবে
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
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    User Masterlist
                </h2>
            }
        >
            <Head title="User Management" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
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
                        <FiSearch className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                    </div>

                    <Link
                        href={route("users.create")}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                    >
                        <FiPlus className="h-4 w-4" />
                        Add New User
                    </Link>
                </div>

                {/* Datatable Frame */}
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                    Emp ID / Name
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                    Contact Info
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                    Dept & Designation
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                    Branch
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-slate-400 font-semibold mt-0.5">
                                            {user.employee_id || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {user.phone || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 dark:text-slate-300 font-semibold">
                                            {user.designation || "N/A"}
                                        </div>
                                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                                            {user.department || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                        {user.branch || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase tracking-wider">
                                            {user.role || "User"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {/* View Details Button */}
                                            <Link
                                                href={route(
                                                    "users.show",
                                                    user.id,
                                                )}
                                                className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-3xs"
                                                title="View Details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </Link>

                                            {/* Edit Button */}
                                            <Link
                                                href={route(
                                                    "users.edit",
                                                    user.id,
                                                )}
                                                className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-3xs"
                                                title="Edit User"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-3xs"
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
                                        className="px-6 py-12 text-center text-slate-400 font-medium"
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
                    <div className="flex items-center justify-between mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                        {/* Info Text */}
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Showing {users.from || 0} to {users.to || 0} of{" "}
                            {users.total} Entries
                        </div>

                        {/* Pagination Links */}
                        <div className="flex items-center gap-1">
                            {users.links.map((link, index) => {
                                // প্রিমিয়াম লুকের জন্য প্রিভিয়াস এবং নেক্সট টেক্সটকে আইকন দিয়ে রিপ্লেস করা হয়েছে
                                const isPrevious =
                                    link.label.includes("Previous");
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
                                        className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-bold rounded-xl border transition-all ${
                                            link.active
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        } ${!link.url ? "opacity-40 cursor-not-allowed" : ""}`}
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
