<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class LeaveService
{
    /**
     * Get (or allocate) an employee's leave balance row for a given
     * leave type and year. Auto-allocates from the leave type's yearly
     * quota, carrying forward unused days from last year if configured.
     */
    public function ensureBalance(int $employeeId, LeaveType $leaveType, int $year): LeaveBalance
    {
        return LeaveBalance::firstOrCreate(
            ['employee_id' => $employeeId, 'leave_type_id' => $leaveType->id, 'year' => $year],
            function () use ($employeeId, $leaveType, $year) {
                $carried = 0;
                if ($leaveType->carry_forward_allowed) {
                    $last = LeaveBalance::where('employee_id', $employeeId)
                        ->where('leave_type_id', $leaveType->id)
                        ->where('year', $year - 1)
                        ->first();
                    if ($last) {
                        $unused = max(0, $last->allocated + $last->carried_forward - $last->used);
                        $carried = min($unused, $leaveType->max_carry_forward_days);
                    }
                }
                return [
                    'allocated'       => $leaveType->days_per_year,
                    'carried_forward' => $carried,
                    'used'            => 0,
                    'pending'         => 0,
                ];
            }
        );
    }

    /**
     * Balance summary for the 4 dashboard cards (Allocated / Used /
     * Pending / Remaining) plus a per-leave-type breakdown.
     */
    public function balanceSummary(int $employeeId, int $year): array
    {
        $leaveTypes = LeaveType::where('is_active', true)->get();
        $breakdown = $leaveTypes->map(function ($type) use ($employeeId, $year) {
            $balance = $this->ensureBalance($employeeId, $type, $year);
            return [
                'leave_type'      => $type->name,
                'code'            => $type->code,
                'allocated'       => (float) $balance->allocated,
                'carried_forward' => (float) $balance->carried_forward,
                'used'            => (float) $balance->used,
                'pending'         => (float) $balance->pending,
                'remaining'       => (float) $balance->remaining,
            ];
        });

        return [
            'breakdown' => $breakdown,
            'totals'    => [
                'allocated' => round($breakdown->sum(fn ($b) => $b['allocated'] + $b['carried_forward']), 1),
                'used'      => round($breakdown->sum('used'), 1),
                'pending'   => round($breakdown->sum('pending'), 1),
                'remaining' => round($breakdown->sum('remaining'), 1),
            ],
        ];
    }

    /**
     * Org-wide balance summary (sum across every employee) — used as the
     * card data for HR/Admin users who don't have a personal Employee
     * record, so the summary cards can always render regardless of who's
     * viewing. Only reflects employees who already have an allocated
     * balance row (i.e. have requested leave at least once, or been
     * pre-allocated) for the given year.
     */
    public function orgBalanceSummary(int $year): array
    {
        $leaveTypes = LeaveType::where('is_active', true)->get();
        $breakdown = $leaveTypes->map(function ($type) use ($year) {
            $balances = LeaveBalance::where('leave_type_id', $type->id)->where('year', $year)->get();
            $allocated = round($balances->sum('allocated') + $balances->sum('carried_forward'), 1);
            $used = round($balances->sum('used'), 1);
            $pending = round($balances->sum('pending'), 1);
            return [
                'leave_type' => $type->name,
                'code'       => $type->code,
                'allocated'  => $allocated,
                'used'       => $used,
                'pending'    => $pending,
                'remaining'  => round($allocated - $used - $pending, 1),
            ];
        });

        return [
            'breakdown' => $breakdown,
            'totals'    => [
                'allocated' => round($breakdown->sum('allocated'), 1),
                'used'      => round($breakdown->sum('used'), 1),
                'pending'   => round($breakdown->sum('pending'), 1),
                'remaining' => round($breakdown->sum('remaining'), 1),
            ],
        ];
    }

    /**
     * Employee submits a new leave request.
     */
    public function requestLeave(Employee $employee, int $leaveTypeId, string $startDate, string $endDate, ?string $reason, bool $isHalfDay = false, ?string $halfDayPeriod = null): LeaveRequest
    {
        $leaveType = LeaveType::findOrFail($leaveTypeId);
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($end->lt($start)) {
            throw new Exception('End date cannot be before start date.');
        }

        if ($isHalfDay) {
            if (!$start->isSameDay($end)) {
                throw new Exception('A half-day request must have the same start and end date.');
            }
            if (!in_array($halfDayPeriod, ['Morning', 'Afternoon'])) {
                throw new Exception('Please specify Morning or Afternoon for a half-day request.');
            }
            $totalDays = 0.5;
        } else {
            $totalDays = $start->diffInDays($end) + 1;
            $halfDayPeriod = null;
        }

        $overlap = LeaveRequest::where('employee_id', $employee->id)
            ->whereIn('status', ['Pending', 'Manager Approved', 'Approved'])
            ->where(fn ($q) => $q->whereBetween('start_date', [$start, $end])
                ->orWhereBetween('end_date', [$start, $end])
                ->orWhere(fn ($q2) => $q2->where('start_date', '<=', $start)->where('end_date', '>=', $end)))
            ->exists();

        if ($overlap) {
            throw new Exception('You already have a leave request overlapping these dates.');
        }

        return DB::transaction(function () use ($employee, $leaveType, $start, $end, $totalDays, $reason, $isHalfDay, $halfDayPeriod) {
            $balance = $this->ensureBalance($employee->id, $leaveType, $start->year);

            if ($totalDays > $balance->remaining) {
                throw new Exception("Insufficient {$leaveType->name} balance. Remaining: {$balance->remaining} day(s), requested: {$totalDays} day(s).");
            }

            $balance->increment('pending', $totalDays);

            return LeaveRequest::create([
                'employee_id'     => $employee->id,
                'leave_type_id'   => $leaveType->id,
                'start_date'      => $start->toDateString(),
                'end_date'        => $end->toDateString(),
                'total_days'      => $totalDays,
                'is_half_day'     => $isHalfDay,
                'half_day_period' => $halfDayPeriod,
                'reason'          => $reason,
                'status'          => 'Pending',
                'manager_id'      => $employee->reporting_manager_id,
                'applied_by'      => Auth::id(),
            ]);
        });
    }

    /**
     * Direct reporting manager's decision (step 1).
     */
    public function managerAction(LeaveRequest $request, string $decision, ?string $remarks): LeaveRequest
    {
        if ($request->status !== 'Pending') {
            throw new Exception('This request has already moved past the manager approval stage.');
        }

        if ($decision === 'approve') {
            $request->update(['status' => 'Manager Approved', 'manager_action_at' => now(), 'manager_remarks' => $remarks]);
        } elseif ($decision === 'reject') {
            $this->releasePending($request);
            $request->update(['status' => 'Rejected', 'manager_action_at' => now(), 'manager_remarks' => $remarks]);
        } else {
            throw new Exception('Invalid decision.');
        }

        return $request->fresh();
    }

    /**
     * HR/Admin final decision (step 2) — or the only decision when the
     * employee has no reporting manager assigned.
     */
    public function hrAction(LeaveRequest $request, string $decision, ?string $remarks): LeaveRequest
    {
        $eligibleStatuses = $request->manager_id ? ['Manager Approved'] : ['Pending', 'Manager Approved'];
        if (!in_array($request->status, $eligibleStatuses)) {
            throw new Exception('This request is not awaiting HR approval.');
        }

        if ($decision === 'approve') {
            return DB::transaction(function () use ($request, $remarks) {
                $balance = LeaveBalance::where('employee_id', $request->employee_id)
                    ->where('leave_type_id', $request->leave_type_id)
                    ->where('year', $request->start_date->year)
                    ->first();

                if ($balance) {
                    $balance->decrement('pending', $request->total_days);
                    $balance->increment('used', $request->total_days);
                }

                $request->update([
                    'status'      => 'Approved',
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'hr_remarks'  => $remarks,
                ]);

                $this->syncAttendance($request);

                return $request->fresh();
            });
        }

        if ($decision === 'reject') {
            $this->releasePending($request);
            $request->update(['status' => 'Rejected', 'approved_by' => Auth::id(), 'approved_at' => now(), 'hr_remarks' => $remarks]);
            return $request->fresh();
        }

        throw new Exception('Invalid decision.');
    }

    /**
     * Employee cancels their own request — only allowed before any approval.
     */
    public function cancel(LeaveRequest $request): LeaveRequest
    {
        if (!in_array($request->status, ['Pending', 'Manager Approved'])) {
            throw new Exception('Only pending requests can be cancelled.');
        }
        $this->releasePending($request);
        $request->update(['status' => 'Cancelled']);
        return $request->fresh();
    }

    protected function releasePending(LeaveRequest $request): void
    {
        $balance = LeaveBalance::where('employee_id', $request->employee_id)
            ->where('leave_type_id', $request->leave_type_id)
            ->where('year', $request->start_date->year)
            ->first();

        if ($balance) {
            $balance->decrement('pending', $request->total_days);
        }
    }

    /**
     * Write a 'Leave' row into attendances for every day in the approved
     * range, linked back via leave_request_id so AttendanceService can tell
     * paid vs unpaid leave apart using leave_type.is_paid.
     */
    protected function syncAttendance(LeaveRequest $request): void
    {
        $period = CarbonPeriod::create($request->start_date, $request->end_date);

        foreach ($period as $date) {
            Attendance::updateOrCreate(
                ['employee_id' => $request->employee_id, 'date' => $date->toDateString()],
                [
                    'status'           => 'Leave',
                    'leave_request_id' => $request->id,
                    'source'           => 'manual',
                    'entry_by'         => Auth::id(),
                    'check_in'         => null,
                    'check_out'        => null,
                    'remarks'          => $request->is_half_day ? "Half Day Leave ({$request->half_day_period})" : null,
                ]
            );
        }
    }
}