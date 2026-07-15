import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Link, usePage } from '@inertiajs/react';

export default function Create({ employees }) {
    const { errors } = usePage().props;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const { data, setData, post, processing } = useForm({
        employee_id: '',
        year: currentYear,
        month: currentMonth,
        total_days: 30,
        working_days: 22,
        present_days: 22,
        absent_days: 0,
        leave_with_pay: 0,
        leave_without_pay: 0,
        late_days: 0,
        bonus: 0,
        arrears: 0,
        fine: 0,
        loan_deduction: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('payrolls.store'));
    };

    return (
        <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Generate Salary Slip</h2>
                <Link href={route('payrolls.index')} className="text-indigo-600 hover:underline text-sm">Back to List</Link>
            </div>

            {errors.error && <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">{errors.error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Employee *</label>
                        <select value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm" required>
                            <option value="">Select Employee</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Year *</label>
                        <input type="number" value={data.year} onChange={e => setData('year', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Month *</label>
                        <select value={data.month} onChange={e => setData('month', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm" required>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>)}
                        </select>
                    </div>
                </div>

                <h3 className="text-md font-bold text-gray-700 border-b pb-1">Attendance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-xs text-gray-600">Total Days</label><input type="number" value={data.total_days} onChange={e => setData('total_days', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                    <div><label className="text-xs text-gray-600">Working Days</label><input type="number" value={data.working_days} onChange={e => setData('working_days', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                    <div><label className="text-xs text-gray-600">Present Days</label><input type="number" value={data.present_days} onChange={e => setData('present_days', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                    <div><label className="text-xs text-gray-600">Absent Days</label><input type="number" value={data.absent_days} onChange={e => setData('absent_days', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-gray-600">Leave With Pay</label><input type="number" value={data.leave_with_pay} onChange={e => setData('leave_with_pay', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                    <div><label className="text-xs text-gray-600">Leave Without Pay</label><input type="number" value={data.leave_without_pay} onChange={e => setData('leave_without_pay', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                    <div><label className="text-xs text-gray-600">Late Present Days</label><input type="number" value={data.late_days} onChange={e => setData('late_days', e.target.value)} className="mt-1 block w-full rounded border-gray-300 text-sm" /></div>
                </div>

                <h3 className="text-md font-bold text-gray-700 border-b pb-1">Financial Adjustments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-xs text-green-700 font-medium">Bonus (BDT)</label><input type="number" value={data.bonus} onChange={e => setData('bonus', e.target.value)} className="mt-1 block w-full rounded border-green-300 bg-green-50 text-sm" /></div>
                    <div><label className="text-xs text-green-700 font-medium">Arrears (BDT)</label><input type="number" value={data.arrears} onChange={e => setData('arrears', e.target.value)} className="mt-1 block w-full rounded border-green-300 bg-green-50 text-sm" /></div>
                    <div><label className="text-xs text-red-700 font-medium">Penalty/Fine</label><input type="number" value={data.fine} onChange={e => setData('fine', e.target.value)} className="mt-1 block w-full rounded border-red-300 bg-red-50 text-sm" /></div>
                    <div><label className="text-xs text-red-700 font-medium">Loan Deduction</label><input type="number" value={data.loan_deduction} onChange={e => setData('loan_deduction', e.target.value)} className="mt-1 block w-full rounded border-red-300 bg-red-50 text-sm" /></div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded shadow">
                        {processing ? 'Calculating...' : 'Generate and Process Slip'}
                    </button>
                </div>
            </form>
        </div>
        </AuthenticatedLayout>
    );
}