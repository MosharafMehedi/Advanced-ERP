import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { 
    FiArrowLeft, FiSave, FiUser, FiDollarSign, FiPercent, 
    FiHome, FiHeart, FiTruck, FiSmartphone, FiWifi,
    FiPieChart, FiUsers, FiBriefcase, FiCheckCircle,
    FiAlertCircle, FiSearch, FiX, FiClock
} from 'react-icons/fi';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

export default function Structure({ employees }) {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
        late_penalty_unit_days: 3,
    });

    useEffect(() => {
        if (selectedEmployee) {
            const fresh = employees.find(e => e.id === selectedEmployee.id);
            if (fresh) setSelectedEmployee(fresh);
        }
        // Only re-run when the employees list itself changes (e.g. after a save),
        // not on every selectedEmployee state change — that would loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employees]);

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
                late_penalty_unit_days: emp.salary_structure.late_penalty_unit_days ?? 3,
            });
        } else {
            reset();
            setData('employee_id', emp.id);
        }
    };

    // Live percentage-sum check so HR sees the problem before even hitting
    // submit — PayrollController/PayrollService both reject > 100% anyway,
    // but catching it here is a much better experience.
    const percentageSum = (
        parseFloat(data.basic_percentage || 0) +
        parseFloat(data.house_rent_percentage || 0) +
        parseFloat(data.medical_percentage || 0) +
        parseFloat(data.conveyance_percentage || 0)
    );
    const percentageOverLimit = percentageSum > 100.01;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (percentageOverLimit) {
            Swal.fire({
                title: 'Percentages exceed 100%',
                text: `Basic + House Rent + Medical + Conveyance currently sum to ${percentageSum.toFixed(2)}%. Please adjust before saving.`,
                icon: 'error',
                ...swalTheme(),
            });
            return;
        }

        router.put(route('payrolls.update', data.employee_id), {
            ...data,
            action: 'salary_structure'
        }, {
            onSuccess: () => {
                router.reload({ only: ['employees'] });
                Swal.fire({
                    title: 'Saved!',
                    text: 'Salary structure updated successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    ...swalTheme(),
                });
            },
            onError: (errors) => {
                Swal.fire({
                    title: 'Failed to save',
                    text: errors.error || 'Please check the form and try again.',
                    icon: 'error',
                    ...swalTheme(),
                });
            },
        });
    };

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || 
               (emp.employee_id && emp.employee_id.toLowerCase().includes(search));
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Salary Structure Settings</h2>}
        >
            <Head title="Salary Structure" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-7xl">
                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600 rounded-sm text-sm flex items-center gap-2">
                            <FiCheckCircle className="h-4 w-4 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiPieChart className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Payroll &nbsp;›&nbsp; Structure
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    Salary Structure Configuration
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={route('payrolls.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FiArrowLeft className="h-3.5 w-3.5" />
                            Back to Payroll
                        </Link>
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Employee List - Left Panel */}
                        <div className="lg:col-span-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <FiUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        Select Employee
                                    </h3>
                                    <div className="relative mt-2">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Search by name or ID..."
                                            className="w-full pl-9 pr-8 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 placeholder-slate-400 transition-colors"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            >
                                                <FiX className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-2 max-h-[600px] overflow-y-auto">
                                    {filteredEmployees.length > 0 ? (
                                        <div className="space-y-1">
                                            {filteredEmployees.map((emp) => {
                                                const isSelected = selectedEmployee?.id === emp.id;
                                                const hasStructure = !!emp.salary_structure;
                                                return (
                                                    <button
                                                        key={emp.id}
                                                        onClick={() => handleEmployeeSelect(emp)}
                                                        className={`w-full text-left p-3 rounded-sm border transition-all ${
                                                            isSelected
                                                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 dark:border-blue-500 shadow-sm'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold ${
                                                                    isSelected 
                                                                        ? 'bg-blue-600 text-white' 
                                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                                }`}>
                                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                                        {emp.first_name} {emp.last_name}
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                        ID: {emp.employee_id}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {hasStructure ? (
                                                                    <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-sm">
                                                                        Configured
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-sm">
                                                                        Not Set
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {emp.designation && (
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                                                <FiBriefcase className="w-3 h-3" />
                                                                {emp.designation.title}
                                                            </p>
                                                        )}
                                                        {emp.gross_salary && (
                                                            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                                                                Gross: {formatCurrency(emp.gross_salary)}
                                                            </p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="flex justify-center mb-2">
                                                <FiUsers className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No employees found</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Configuration Form - Right Panel */}
                        <div className="lg:col-span-8">
                            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                                {selectedEmployee ? (
                                    <form onSubmit={handleSubmit}>
                                        {/* Header */}
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Configure Structure for:
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                                                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            ID: {selectedEmployee.employee_id}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700">
                                                    Gross: <span className="font-semibold text-slate-900 dark:text-white">
                                                        {formatCurrency(selectedEmployee.gross_salary || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Percentage Based Components */}
                                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                                <FiPercent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                Percentage Based Components
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        Basic Salary (%)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.basic_percentage}
                                                            onChange={e => setData('basic_percentage', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiHome className="inline h-3 w-3 mr-1" /> House Rent (%)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.house_rent_percentage}
                                                            onChange={e => setData('house_rent_percentage', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiHeart className="inline h-3 w-3 mr-1" /> Medical (%)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.medical_percentage}
                                                            onChange={e => setData('medical_percentage', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiTruck className="inline h-3 w-3 mr-1" /> Conveyance (%)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.conveyance_percentage}
                                                            onChange={e => setData('conveyance_percentage', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`mt-2 text-xs p-2 rounded-sm flex items-center gap-1.5 ${
                                                percentageOverLimit
                                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-semibold'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <FiAlertCircle className="h-3 w-3 shrink-0" />
                                                {percentageOverLimit
                                                    ? `Sum is ${percentageSum.toFixed(2)}% — exceeds 100%. This must be fixed before saving.`
                                                    : `Sum: ${percentageSum.toFixed(2)}% of gross salary. Percentages are calculated based on the employee's gross salary.`}
                                            </div>
                                        </div>

                                        {/* Fixed Allowances */}
                                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                                <FiDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                Fixed Monthly Allowances (BDT)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        Other Allowance
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.fixed_allowance}
                                                        onChange={e => setData('fixed_allowance', e.target.value)}
                                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiSmartphone className="inline h-3 w-3 mr-1" /> Mobile Allowance
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.mobile_allowance}
                                                        onChange={e => setData('mobile_allowance', e.target.value)}
                                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiWifi className="inline h-3 w-3 mr-1" /> Internet Allowance
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.internet_allowance}
                                                        onChange={e => setData('internet_allowance', e.target.value)}
                                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                                <FiDollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                Deductions
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        Provident Fund (% of Basic)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.provident_fund_percentage}
                                                            onChange={e => setData('provident_fund_percentage', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        Fixed Income Tax (BDT)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.tax_deduction_fixed}
                                                        onChange={e => setData('tax_deduction_fixed', e.target.value)}
                                                        className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                        <FiClock className="inline h-3 w-3 mr-1" /> Late Penalty Rule
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={data.late_penalty_unit_days}
                                                            onChange={e => setData('late_penalty_unit_days', e.target.value)}
                                                            className="w-full text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm py-2 px-3 pr-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-300 transition-colors"
                                                            min="1"
                                                            max="31"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">late days = 1 day cut</span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                                        e.g. 3 means every 3 late days deducts 1 day's pay. Default is 3.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-b-sm">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    <FiCheckCircle className="inline h-3.5 w-3.5 text-emerald-600 mr-1" />
                                                    Configured structure will be used for salary generation
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEmployee(null);
                                                            reset();
                                                        }}
                                                        className="flex-1 sm:flex-none px-6 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                                                    >
                                                        Reset Form
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={processing || percentageOverLimit}
                                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FiSave className="h-3.5 w-3.5" />
                                                        {processing ? 'Saving...' : 'Save Structure'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    // Empty State
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                            <FiUser className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-300">
                                            No Employee Selected
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Please select an employee from the left panel to configure their salary structure.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
