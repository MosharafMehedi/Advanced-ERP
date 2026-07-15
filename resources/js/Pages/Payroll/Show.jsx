import React from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function Show({ payroll }) {
    const { data, setData, put, processing } = useForm({
        action: 'pay',
        payment_method: 'Bank Transfer',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
    });

    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (confirm('Confirm salary disbursement?')) {
            put(route('payrolls.update', payroll.id));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <Link href={route('payrolls.index')} className="text-indigo-600 hover:underline">&larr; Back to Payroll List</Link>
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-900">Print Payslip</button>
            </div>

            {/* PaySlip UI Template */}
            <div className="bg-white p-8 rounded-lg shadow border border-gray-200 printable-area">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">COMPANY NAME</h2>
                    <p className="text-gray-500 text-sm">Salary Slip for {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })}, {payroll.year}</p>
                </div>

                {/* Info Metadata */}
                <div className="grid grid-cols-2 gap-4 border-b border-t py-4 mb-6 text-sm">
                    <div>
                        <p><span className="text-gray-500">Employee ID:</span> <span className="font-semibold">{payroll.employee?.employee_id}</span></p>
                        <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{payroll.employee?.first_name} {payroll.employee?.last_name}</span></p>
                        <p><span className="text-gray-500">Department:</span> {payroll.employee?.department?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="text-gray-500">Slip No:</span> #{payroll.id}</p>
                        <p><span className="text-gray-500">Status:</span> <span className="font-bold text-indigo-600">{payroll.status}</span></p>
                        <p><span className="text-gray-500">Gross Contractual:</span> {payroll.gross_salary} BDT</p>
                    </div>
                </div>

                {/* Earnings & Deductions Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                    <div>
                        <h4 className="font-bold text-green-700 mb-2 border-b pb-1">Earnings & Allowances</h4>
                        <table className="w-full text-sm space-y-2">
                            {payroll.details?.filter(d => d.type === 'Allowance').map(d => (
                                <tr key={d.id}><td>{d.name}</td><td className="text-right font-medium">{d.amount} BDT</td></tr>
                            ))}
                        </table>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-700 mb-2 border-b pb-1">Deductions</h4>
                        <table className="w-full text-sm">
                            {payroll.details?.filter(d => d.type === 'Deduction').map(d => (
                                <tr key={d.id}><td>{d.name}</td><td className="text-right font-medium text-red-600">-{d.amount} BDT</td></tr>
                            ))}
                        </table>
                    </div>
                </div>

                {/* Final Calculations Summary */}
                <div className="mt-4 bg-gray-50 p-4 rounded grid grid-cols-2 text-sm gap-2">
                    <div>
                        <p>Total Earnings: <span className="font-semibold">{payroll.total_allowance} BDT</span></p>
                        <p>Total Deductions: <span className="font-semibold text-red-600">{payroll.total_deduction} BDT</span></p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                        <h3 className="text-lg font-bold">Net Payable Amount:</h3>
                        <h2 className="text-2xl font-black text-indigo-700">{payroll.net_payable} BDT</h2>
                    </div>
                </div>
            </div>

            {/* Integrated Release Payment Actions Panel */}
            {payroll.status === 'Approved' && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4">Release & Disburse Salary</h3>
                    <form onSubmit={handlePaySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm">
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Mobile Banking">Mobile Banking</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Transaction Reference / Note</label>
                            <input type="text" value={data.transaction_reference} onChange={e => setData('transaction_reference', e.target.value)} placeholder="e.g. Bank Ref No" className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm" />
                        </div>
                        <div>
                            <button type="submit" disabled={processing} className="w-full py-2 bg-green-600 text-white font-medium rounded shadow hover:bg-green-700 transition text-sm">
                                {processing ? 'Processing...' : 'Mark as PAID'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}