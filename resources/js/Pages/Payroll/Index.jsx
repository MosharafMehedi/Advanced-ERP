import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';

export default function Index({ payrolls, filters }) {
    const { flash } = usePage().props;

    const handleFilterChange = (key, value) => {
        router.get(route('payrolls.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const handleApprove = (id) => {
        if (confirm('Are you sure you want to approve this payroll?')) {
            router.put(route('payrolls.update', id), { action: 'approve' });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this salary slip?')) {
            router.delete(route('payrolls.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
                <div className="space-x-2">
                    <Link href={route('payrolls.edit', 0)} className="px-4 py-2 bg-amber-500 text-white rounded shadow text-sm hover:bg-amber-600">
                        Salary Structure Settings
                    </Link>
                    <Link href={route('payrolls.create')} className="px-4 py-2 bg-indigo-600 text-white rounded shadow text-sm hover:bg-indigo-700">
                        Generate Salary Slip
                    </Link>
                </div>
            </div>

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-200">{flash.success}</div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500">Year</label>
                    <input type="number" value={filters.year || ''} onChange={e => handleFilterChange('year', e.target.value)} placeholder="e.g. 2026" className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Month</label>
                    <select value={filters.month || ''} onChange={e => handleFilterChange('month', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm">
                        <option value="">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Status</label>
                    <select value={filters.status || ''} onChange={e => handleFilterChange('status', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm">
                        <option value="">All Status</option>
                        <option value="Generated">Generated</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Employee</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Period</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Gross Salary</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Net Payable</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payrolls.data.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{row.employee?.first_name} {row.employee?.last_name}</div>
                                    <div className="text-xs text-gray-500">ID: {row.employee?.employee_id}</div>
                                </td>
                                <td className="px-6 py-4">{new Date(row.year, row.month - 1).toLocaleString('default', { month: 'short' })}, {row.year}</td>
                                <td className="px-6 py-4">{row.gross_salary} BDT</td>
                                <td className="px-6 py-4 font-bold text-indigo-600">{row.net_payable} BDT</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        row.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                        row.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                    }`}>{row.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Link href={route('payrolls.show', row.id)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-2">View Slip</Link>
                                    {row.status === 'Generated' && (
                                        <button onClick={() => handleApprove(row.id)} className="text-green-600 hover:text-green-900 font-medium mr-2">Approve</button>
                                    )}
                                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </AuthenticatedLayout>
    );
}