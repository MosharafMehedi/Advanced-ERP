<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollDetail;
use App\Models\SalaryStructure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class PayrollService
{
    /**
     * Generate a salary slip for one employee for one month.
     *
     * @throws Exception if a structure is missing or a slip already exists
     */
    public function calculateSalary(Employee $employee, int $year, int $month, array $input): Payroll
    {
        $structure = SalaryStructure::where('employee_id', $employee->id)
            ->where('is_active', true)
            ->first();

        if (!$structure) {
            throw new Exception("No salary structure configured for {$employee->first_name} {$employee->last_name}. Please set it up first.");
        }

        if (Payroll::where('employee_id', $employee->id)->where('year', $year)->where('month', $month)->exists()) {
            throw new Exception('A salary slip already exists for this employee for the selected month.');
        }

        $gross = (float) $employee->gross_salary;

        $totalDays        = (int) ($input['total_days'] ?? 30);
        $presentDays       = (int) ($input['present_days'] ?? 0);
        $absentDays        = (int) ($input['absent_days'] ?? 0);
        $leaveWithPay      = (int) ($input['leave_with_pay'] ?? 0);
        $leaveWithoutPay   = (int) ($input['leave_without_pay'] ?? 0);
        $lateDays          = (int) ($input['late_days'] ?? 0);

        $bonus          = (float) ($input['bonus'] ?? 0);
        $arrears        = (float) ($input['arrears'] ?? 0);
        $fine           = (float) ($input['fine'] ?? 0);
        $loanDeduction  = (float) ($input['loan_deduction'] ?? 0);

        $perDayRate = $totalDays > 0 ? $gross / $totalDays : 0;

        // --- Earnings (based on full structure, attendance handled as a deduction line) ---
        $basic      = round($gross * $structure->basic_percentage / 100, 2);
        $houseRent  = round($gross * $structure->house_rent_percentage / 100, 2);
        $medical    = round($gross * $structure->medical_percentage / 100, 2);
        $conveyance = round($gross * $structure->conveyance_percentage / 100, 2);

        $earnings = [
            ['name' => 'Basic Salary', 'amount' => $basic],
            ['name' => 'House Rent Allowance', 'amount' => $houseRent],
            ['name' => 'Medical Allowance', 'amount' => $medical],
            ['name' => 'Conveyance Allowance', 'amount' => $conveyance],
        ];
        if ($structure->fixed_allowance > 0) {
            $earnings[] = ['name' => 'Fixed Allowance', 'amount' => (float) $structure->fixed_allowance];
        }
        if ($structure->mobile_allowance > 0) {
            $earnings[] = ['name' => 'Mobile Allowance', 'amount' => (float) $structure->mobile_allowance];
        }
        if ($structure->internet_allowance > 0) {
            $earnings[] = ['name' => 'Internet Allowance', 'amount' => (float) $structure->internet_allowance];
        }
        if ($bonus > 0) {
            $earnings[] = ['name' => 'Bonus', 'amount' => $bonus];
        }
        if ($arrears > 0) {
            $earnings[] = ['name' => 'Arrears', 'amount' => $arrears];
        }

        // --- Deductions ---
        $deductions = [];

        $providentFund = round($basic * $structure->provident_fund_percentage / 100, 2);
        if ($providentFund > 0) {
            $deductions[] = ['name' => 'Provident Fund', 'amount' => $providentFund];
        }

        if ($structure->tax_deduction_fixed > 0) {
            $deductions[] = ['name' => 'Income Tax', 'amount' => (float) $structure->tax_deduction_fixed];
        }

        // Unpaid absence: absent days + leave without pay are deducted at the per-day rate.
        $unpaidDays = $absentDays + $leaveWithoutPay;
        if ($unpaidDays > 0) {
            $deductions[] = ['name' => 'Absence Deduction (' . $unpaidDays . ' day(s))', 'amount' => round($perDayRate * $unpaidDays, 2)];
        }

        // Late penalty: every 3 late days costs 1 day's pay (common BD convention).
        $latePenaltyDays = intdiv($lateDays, 3);
        if ($latePenaltyDays > 0) {
            $deductions[] = ['name' => 'Late Attendance Penalty', 'amount' => round($perDayRate * $latePenaltyDays, 2)];
        }

        if ($fine > 0) {
            $deductions[] = ['name' => 'Fine / Penalty', 'amount' => $fine];
        }
        if ($loanDeduction > 0) {
            $deductions[] = ['name' => 'Loan Deduction', 'amount' => $loanDeduction];
        }

        $totalAllowance = round(array_sum(array_column($earnings, 'amount')), 2);
        $totalDeduction = round(array_sum(array_column($deductions, 'amount')), 2);
        $netPayable     = round($totalAllowance - $totalDeduction, 2);

        return DB::transaction(function () use (
            $employee, $year, $month, $input, $gross,
            $totalDays, $presentDays, $absentDays, $leaveWithPay, $leaveWithoutPay, $lateDays,
            $bonus, $arrears, $fine, $loanDeduction,
            $totalAllowance, $totalDeduction, $netPayable, $earnings, $deductions
        ) {
            $payroll = Payroll::create([
                'slip_no'           => $this->generateSlipNo($employee, $year, $month),
                'employee_id'       => $employee->id,
                'year'              => $year,
                'month'             => $month,
                'total_days'        => $totalDays,
                'working_days'      => $input['working_days'] ?? 0,
                'present_days'      => $presentDays,
                'absent_days'       => $absentDays,
                'leave_with_pay'    => $leaveWithPay,
                'leave_without_pay' => $leaveWithoutPay,
                'late_days'         => $lateDays,
                'bonus'             => $bonus,
                'arrears'           => $arrears,
                'fine'              => $fine,
                'loan_deduction'    => $loanDeduction,
                'gross_salary'      => $gross,
                'total_allowance'   => $totalAllowance,
                'total_deduction'   => $totalDeduction,
                'net_payable'       => $netPayable,
                'status'            => 'Generated',
                'processed_by'      => Auth::id(),
            ]);

            foreach ($earnings as $row) {
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'type'       => 'Allowance',
                    'name'       => $row['name'],
                    'amount'     => $row['amount'],
                ]);
            }
            foreach ($deductions as $row) {
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'type'       => 'Deduction',
                    'name'       => $row['name'],
                    'amount'     => $row['amount'],
                ]);
            }

            return $payroll;
        });
    }

    protected function generateSlipNo(Employee $employee, int $year, int $month): string
    {
        return sprintf('PS-%d%02d-%s', $year, $month, $employee->employee_id ?? $employee->id);
    }
}
