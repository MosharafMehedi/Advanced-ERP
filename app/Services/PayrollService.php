<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollDetail;
use App\Models\SalaryStructure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class PayrollService
{
    public function __construct(protected AttendanceService $attendanceService)
    {
    }

    /**
     * Generate a salary slip for one employee for one month.
     *
     * Attendance figures (total_days, working_days, present_days, absent_days,
     * leave_with_pay, leave_without_pay, late_days) are pulled directly from
     * AttendanceService::monthlySummary() — the authoritative, proration-aware
     * source — rather than trusted blindly from form input. $input is still
     * used for the genuinely manual figures (bonus/arrears/fine/loan_deduction)
     * and as an explicit override escape hatch (see $input['force_negative']).
     *
     * @param  array  $input  ['bonus', 'arrears', 'fine', 'loan_deduction', 'force_negative' => bool]
     * @param  int|null  $processedBy  Defaults to the logged-in user; pass explicitly when
     *                                 generating from a queued job/CLI where Auth::id() is null.
     *
     * @throws Exception if a structure is missing, invalid, a slip already exists,
     *                    or net payable would go negative without explicit override.
     */
    public function calculateSalary(Employee $employee, int $year, int $month, array $input = [], ?int $processedBy = null): Payroll
    {
        $structure = SalaryStructure::where('employee_id', $employee->id)
            ->where('is_active', true)
            ->first();

        if (!$structure) {
            throw new Exception("No salary structure configured for {$employee->first_name} {$employee->last_name}. Please set it up first.");
        }

        $this->assertStructureIsValid($employee, $structure);

        $processedBy ??= Auth::id();

        // --- Attendance figures come from the single source of truth ---
        $summary = $this->attendanceService->monthlySummary($employee->id, $year, $month);

        $totalDays       = $summary['total_days'];
        $workingDays     = $summary['working_days'];
        $presentDays     = $summary['present_days'];
        $absentDays      = $summary['absent_days'];
        $leaveWithPay    = $summary['leave_with_pay'];
        $leaveWithoutPay = $summary['leave_without_pay'];
        $lateDays        = $summary['late_days'];

        if ($totalDays <= 0) {
            throw new Exception("{$employee->first_name} {$employee->last_name} was not employed during this month (joined after / resigned before it). Cannot generate a salary slip.");
        }

        // --- Genuinely manual, HR-entered figures ---
        $bonus         = (float) ($input['bonus'] ?? 0);
        $arrears       = (float) ($input['arrears'] ?? 0);
        $fine          = (float) ($input['fine'] ?? 0);
        $loanDeduction = (float) ($input['loan_deduction'] ?? 0);
        $forceNegative = (bool) ($input['force_negative'] ?? false);

        // Race-condition-safe: lock any existing row for this employee+period
        // for the duration of the transaction so two simultaneous "Generate"
        // clicks can't both pass the exists() check and both insert.
        return DB::transaction(function () use (
            $employee, $year, $month, $structure, $processedBy,
            $totalDays, $workingDays, $presentDays, $absentDays, $leaveWithPay, $leaveWithoutPay, $lateDays,
            $bonus, $arrears, $fine, $loanDeduction, $forceNegative
        ) {
            $existing = Payroll::where('employee_id', $employee->id)
                ->where('year', $year)
                ->where('month', $month)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                throw new Exception('A salary slip already exists for this employee for the selected month.');
            }

            $gross = (float) $employee->gross_salary;
            $perDayRate = $totalDays > 0 ? $gross / $totalDays : 0;

            // --- Earnings ---
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

            // Unpaid absence: absent days + leave without pay, at the per-day rate.
            $unpaidDays = $absentDays + $leaveWithoutPay;
            if ($unpaidDays > 0) {
                $deductions[] = ['name' => 'Absence Deduction (' . $unpaidDays . ' day(s))', 'amount' => round($perDayRate * $unpaidDays, 2)];
            }

            // Late penalty: configurable via salary_structures.late_penalty_unit_days
            // if that column exists, otherwise falls back to the 3-day convention.
            $latePenaltyUnit = (Schema::hasColumn('salary_structures', 'late_penalty_unit_days') && $structure->late_penalty_unit_days > 0)
                ? (int) $structure->late_penalty_unit_days
                : 3;
            $latePenaltyDays = intdiv($lateDays, $latePenaltyUnit);
            if ($latePenaltyDays > 0) {
                $deductions[] = ['name' => "Late Attendance Penalty ({$lateDays} late day(s))", 'amount' => round($perDayRate * $latePenaltyDays, 2)];
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

            // Negative net pay is almost always a data-entry mistake (fine/loan
            // deduction too large). Refuse silently allowing it — HR must pass
            // force_negative=true to knowingly proceed with a negative slip.
            if ($netPayable < 0 && !$forceNegative) {
                throw new Exception(sprintf(
                    'Net payable would be negative (%.2f) for %s %s — total deductions (%.2f) exceed total earnings (%.2f). Review the fine/loan/absence figures, or resubmit with force_negative to proceed anyway.',
                    $netPayable, $employee->first_name, $employee->last_name, $totalDeduction, $totalAllowance
                ));
            }

            $payroll = Payroll::create([
                'slip_no'           => $this->generateSlipNo($employee, $year, $month),
                'employee_id'       => $employee->id,
                'year'              => $year,
                'month'             => $month,
                'total_days'        => $totalDays,
                'working_days'      => $workingDays,
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
                'processed_by'      => $processedBy,
            ]);

            $now = now();
            $detailRows = array_merge(
                array_map(fn ($row) => [
                    'payroll_id' => $payroll->id,
                    'type'       => 'Allowance',
                    'name'       => $row['name'],
                    'amount'     => $row['amount'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $earnings),
                array_map(fn ($row) => [
                    'payroll_id' => $payroll->id,
                    'type'       => 'Deduction',
                    'name'       => $row['name'],
                    'amount'     => $row['amount'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $deductions)
            );

            // Bulk insert instead of one query per row — matters once bulk
            // month-end generation runs across the whole company.
            PayrollDetail::insert($detailRows);

            return $payroll;
        });
    }

    /**
     * Sanity-check a salary structure before it's used to generate a slip.
     * Percentages summing above 100% would mean earnings exceed gross salary
     * before any allowances are even added — almost certainly a data-entry
     * error in the structure, not an intentional design.
     */
    protected function assertStructureIsValid(Employee $employee, SalaryStructure $structure): void
    {
        $percentageSum = $structure->basic_percentage
            + $structure->house_rent_percentage
            + $structure->medical_percentage
            + $structure->conveyance_percentage;

        if ($percentageSum > 100.01) {
            throw new Exception(sprintf(
                'Salary structure for %s %s is invalid: basic + house rent + medical + conveyance percentages sum to %.2f%%, which exceeds 100%%. Please fix the structure before generating payroll.',
                $employee->first_name, $employee->last_name, $percentageSum
            ));
        }
    }

    protected function generateSlipNo(Employee $employee, int $year, int $month): string
    {
        return sprintf('PS-%d%02d-%s', $year, $month, $employee->employee_id ?? $employee->id);
    }
}