import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';

export default function Structure({ employees }) {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const { flash } = usePage().props;

    const { data, setData, reset, processing } = useForm({
        employee_id: '',
        basic_percentage: 50,
        house_rent_percentage: 30,
        medical_percentage: 10,
        conveyance_percentage: 10,
        fixed_allowance: 0,
        mobile_allowance: 0,
        internet_allowance: 0,
        provident_fund_percentage: 0,
        tax_deduction_fixed: 0,
    });

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        if (emp.salary_structure) {
            setData({
                employee_id: emp.id,
                basic_percentage: emp.salary_structure.basic_percentage,
                house_rent_percentage: emp.salary_structure.house_rent_percentage,
                medical_percentage: emp.salary_structure.medical_percentage,
                conveyance_percentage: emp.salary_structure.conveyance_percentage,
                fixed_allowance: emp.salary_structure.fixed_allowance,
                mobile_allowance: emp.salary_structure.mobile_allowance,
                internet_allowance: emp.salary_structure.internet_allowance,
                provident_fund_percentage: emp.salary_structure.provident_fund_percentage,
                tax_deduction_fixed: emp.salary_structure.tax_deduction_fixed,
            });
        } else {
            reset();
            setData('employee_id', emp.id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Single Controller / Resource Route Pattern
        router.put(route('payrolls.update', data.employee_id), {
            ...data,
            action: 'salary_structure'
        }, {
            onSuccess: () => alert('Salary structure configuration updated!')
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Salary Structure Settings</h2>
            {flash?.success && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{flash.success}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow col-span-1">
                    <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Select Employee</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {employees.map((emp) => (
                            <button key={emp.id} onClick={() => handleEmployeeSelect(emp)} className={`w-full text-left p-3 rounded border transition ${selectedEmployee?.id === emp.id ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                <p className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                                <p className="text-xs text-gray-500">ID: {emp.employee_id} | Gross: {emp.gross_salary} BDT</p>
                                {emp.salary_structure ? <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-1 inline-block">Configured</span> : <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block">Not Configured</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow col-span-2">
                    {selectedEmployee ? (
                        <form onSubmit={handleSubmit}>
                            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Configure Structure for: <span className="text-indigo-600">{selectedEmployee.first_name} {selectedEmployee.last_name}</span></h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div><label className="text-sm font-medium text-gray-700">Basic (%)</label><input type="number" value={data.basic_percentage} onChange={e => setData('basic_percentage', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">House Rent (%)</label><input type="number" value={data.house_rent_percentage} onChange={e => setData('house_rent_percentage', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">Medical (%)</label><input type="number" value={data.medical_percentage} onChange={e => setData('medical_percentage', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">Conveyance (%)</label><input type="number" value={data.conveyance_percentage} onChange={e => setData('conveyance_percentage', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Fixed Monthly Allowances (BDT)</h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div><label className="text-sm font-medium text-gray-700">Other Allowance</label><input type="number" value={data.fixed_allowance} onChange={e => setData('fixed_allowance', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">Mobile</label><input type="number" value={data.mobile_allowance} onChange={e => setData('mobile_allowance', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">Internet</label><input type="number" value={data.internet_allowance} onChange={e => setData('internet_allowance', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Deductions</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div><label className="text-sm font-medium text-gray-700">PF (% of Basic)</label><input type="number" value={data.provident_fund_percentage} onChange={e => setData('provident_fund_percentage', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                                <div><label className="text-sm font-medium text-gray-700">Fixed Income Tax</label><input type="number" value={data.tax_deduction_fixed} onChange={e => setData('tax_deduction_fixed', e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm" /></div>
                            </div>
                            <div className="flex justify-end"><button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded shadow font-medium hover:bg-indigo-700">{processing ? 'Saving...' : 'Save Structure'}</button></div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400"><p className="text-lg font-medium">Please select an employee to configure salary structure.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}