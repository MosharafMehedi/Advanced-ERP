<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\SalaryStructure;
use App\Models\SalarySlipDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class PayrollService
{
    /**
     * Calculate and save salary for a single employee
     */
    public function calculateSalary(Employee $employee, $year, $month, array $attendance = [])
    {
        return DB::transaction(function () use ($employee, $year, $month, $attendance) {
            // ১. এমপ্লয়ির স্যালারি স্ট্রাকচার এবং অফিসিয়াল গ্রস স্যালারি চেক করা
            $structure = $employee->salaryStructure;
            if (!$structure) {
                throw new Exception("Salary structure not defined for Employee: {$employee->employee_id}");
            }

            $grossSalary = $employee->gross_salary ?? 0;
            if ($grossSalary <= 0) {
                throw new Exception("Gross salary must be greater than 0 for Employee: {$employee->employee_id}");
            }

            // ২. অ্যাটেনডেন্সের ডিফল্ট ডাটা সেটআপ করা
            $totalDays = $attendance['total_days'] ?? 30;
            $workingDays = $attendance['working_days'] ?? 22;
            $presentDays = $attendance['present_days'] ?? 22;
            $absentDays = $attendance['absent_days'] ?? 0;
            $leaveWithPay = $attendance['leave_with_pay'] ?? 0;
            $leaveWithoutPay = $attendance['leave_without_pay'] ?? 0;
            $lateDays = $attendance['late_days'] ?? 0;

            // ৩. Earnings ব্রেকডাউন হিসাব করা (গ্রস স্যালারির ওপর পার্সেন্টেজ অনুযায়ী)
            $basic = round(($grossSalary * $structure->basic_percentage) / 100, 2);
            $houseRent = round(($grossSalary * $structure->house_rent_percentage) / 100, 2);
            $medical = round(($grossSalary * $structure->medical_percentage) / 100, 2);
            $conveyance = round(($grossSalary * $structure->conveyance_percentage) / 100, 2);

            $fixedAllowance = $structure->fixed_allowance ?? 0;
            $mobileAllowance = $structure->mobile_allowance ?? 0;
            $internetAllowance = $structure->internet_allowance ?? 0;

            // ৪. অতিরিক্ত আর্নিংস (যেমন: বোনাস বা এরিয়ার যদি ইনপুট হিসেবে পাঠানো হয়)
            $bonus = $attendance['bonus'] ?? 0;
            $arrears = $attendance['arrears'] ?? 0;

            $totalEarnings = $grossSalary + $fixedAllowance + $mobileAllowance + $internetAllowance + $bonus + $arrears;

            // ৫. Deductions হিসাব করা
            $providentFund = round(($basic * $structure->provident_fund_percentage) / 100, 2);
            $tax = $structure->tax_deduction_fixed ?? 0;

            // unpaid_leaves (বিনা বেতনে ছুটি) এর জন্য স্যালারি কর্তন লজিক
            $unpaidLeavePenalty = 0;
            if ($leaveWithoutPay > 0 && $totalDays > 0) {
                // ১ দিনের বেসিক বা গ্রস স্যালারি অনুযায়ী ডিডাকশন (এখানে ১ দিনের গ্রস স্যালারি কাটা হচ্ছে)
                $oneDaySalary = $grossSalary / $totalDays;
                $unpaidLeavePenalty = round($oneDaySalary * $leaveWithoutPay, 2);
            }

            // লেট বা ফাইন (যদি ইনপুট হিসেবে পাঠানো হয়)
            $fine = $attendance['fine'] ?? 0;
            $loanDeduction = $attendance['loan_deduction'] ?? 0;

            $totalDeductions = $providentFund + $tax + $unpaidLeavePenalty + $fine + $loanDeduction;

            // ৬. Net Payable হিসাব করা
            $netPayable = $totalEarnings - $totalDeductions;

            // ৭. স্যালারি স্লিপের জন্য ইউনিক স্লিপ নম্বর জেনারেট করা
            $slipNo = 'SLIP-' . $year . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . $employee->id;

            // ৮. স্যালারি স্লিপ ক্রিয়েট বা আপডেট করা (যদি অলরেডি জেনারেট করা থাকে)
            $payroll = Payroll::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'year' => $year,
                    'month' => $month,
                ],
                [
                    'salary_slip_no' => $slipNo,
                    'total_days' => $totalDays,
                    'working_days' => $workingDays,
                    'present_days' => $presentDays,
                    'absent_days' => $absentDays,
                    'leave_with_pay' => $leaveWithPay,
                    'leave_without_pay' => $leaveWithoutPay,
                    'late_days' => $lateDays,
                    'gross_salary' => $grossSalary,
                    'total_earnings' => $totalEarnings,
                    'total_deductions' => $totalDeductions,
                    'net_payable' => $netPayable,
                    'status' => 'Generated',
                    'bank_name' => $employee->bank_name ?? null,
                    'bank_branch_name' => $employee->bank_branch_name ?? null,
                    'bank_account_no' => $employee->bank_account_no ?? null,
                    'processed_by' => Auth::id(),
                ]
            );

            // ৯. পূর্বের স্লিপ ডিটেইলস ক্লিয়ার করে নতুন করে ব্রেকডাউন সেভ করা
            $payroll->details()->delete();

            $components = [
                // Earnings
                ['type' => 'earnings', 'name' => 'Basic Salary', 'amount' => $basic],
                ['type' => 'earnings', 'name' => 'House Rent Allowance', 'amount' => $houseRent],
                ['type' => 'earnings', 'name' => 'Medical Allowance', 'amount' => $medical],
                ['type' => 'earnings', 'name' => 'Conveyance Allowance', 'amount' => $conveyance],
                ['type' => 'earnings', 'name' => 'Fixed Allowance', 'amount' => $fixedAllowance],
                ['type' => 'earnings', 'name' => 'Mobile Allowance', 'amount' => $mobileAllowance],
                ['type' => 'earnings', 'name' => 'Internet Allowance', 'amount' => $internetAllowance],
                ['type' => 'earnings', 'name' => 'Festival Bonus', 'amount' => $bonus],
                ['type' => 'earnings', 'name' => 'Arrears', 'amount' => $arrears],

                // Deductions
                ['type' => 'deductions', 'name' => 'Provident Fund', 'amount' => $providentFund],
                ['type' => 'deductions', 'name' => 'Income Tax', 'amount' => $tax],
                ['type' => 'deductions', 'name' => 'Unpaid Leave Penalty', 'amount' => $unpaidLeavePenalty, 'remarks' => "{$leaveWithoutPay} days unpaid leave"],
                ['type' => 'deductions', 'name' => 'Fine/Penalty', 'amount' => $fine],
                ['type' => 'deductions', 'name' => 'Loan Recovery', 'amount' => $loanDeduction],
            ];

            foreach ($components as $component) {
                if ($component['amount'] > 0) {
                    SalarySlipDetail::create([
                        'salary_slip_id' => $payroll->id,
                        'type' => $component['type'],
                        'component_name' => $component['name'],
                        'amount' => $component['amount'],
                        'remarks' => $component['remarks'] ?? null,
                    ]);
                }
            }

            return $payroll;
        });
    }
}