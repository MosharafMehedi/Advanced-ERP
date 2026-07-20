<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class AttendanceService
{
    /**
     * Get the shift to apply for an employee — their assigned shift, or the
     * first active shift as a fallback so late/OT math never silently no-ops.
     */
    protected function resolveShift(Employee $employee): ?Shift
    {
        return $employee->shift ?? Shift::where('is_active', true)->first();
    }

    /**
     * Overnight-shift-aware start/end window for a shift on a given date.
     * If end_time <= start_time, the shift is treated as crossing midnight
     * (e.g. 22:00 -> 06:00), so the end is pushed to the next calendar day.
     * Returns [Carbon $start, Carbon $end].
     */
    protected function shiftWindow(Shift $shift, Carbon $onDate): array
    {
        $start = Carbon::parse($onDate->toDateString() . ' ' . $shift->start_time);
        $end   = Carbon::parse($onDate->toDateString() . ' ' . $shift->end_time);

        if ($end->lessThanOrEqualTo($start)) {
            $end->addDay();
        }

        return [$start, $end];
    }

    /**
     * Employee self check-in, or HR/manager punching it in on their behalf.
     * Wrapped in a locked transaction so two near-simultaneous check-ins
     * (e.g. double biometric hit) can't create duplicate/lost-update rows.
     */
    public function checkIn(Employee $employee, string $source = 'self', ?string $ip = null, ?string $deviceId = null, ?string $remarks = null): Attendance
    {
        $today = Carbon::today()->toDateString();

        return DB::transaction(function () use ($employee, $source, $ip, $deviceId, $remarks, $today) {
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->lockForUpdate()
                ->first();

            if ($attendance && $attendance->check_in) {
                throw new Exception('Already checked in today at ' . $attendance->check_in . '.');
            }

            $attendance ??= new Attendance(['employee_id' => $employee->id, 'date' => $today]);

            $shift = $this->resolveShift($employee);
            $now = Carbon::now();

            $status = 'Present';
            $lateMinutes = 0;

            if ($shift) {
                [$shiftStart] = $this->shiftWindow($shift, $now);
                $graceLimit = $shiftStart->copy()->addMinutes($shift->grace_minutes ?? 0);

                if ($now->gt($graceLimit)) {
                    $lateMinutes = $shiftStart->diffInMinutes($now);
                    $status = 'Late';
                }
            }

            $attendance->fill([
                'shift_id'     => $shift?->id,
                'check_in'     => $now->format('H:i:s'),
                'status'       => $status,
                'late_minutes' => $lateMinutes,
                'source'       => $source,
                'ip_address'   => $ip,
                'device_id'    => $deviceId,
                'remarks'      => $remarks,
                'entry_by'     => $source === 'manual' ? Auth::id() : null,
            ])->save();

            return $attendance;
        });
    }

    /**
     * Employee self check-out, or HR/manager punching it out on their behalf.
     * Overnight shifts are handled — overtime/early-leave math no longer
     * breaks when end_time is numerically earlier than start_time.
     */
    public function checkOut(Employee $employee, string $source = 'self', ?string $remarks = null): Attendance
    {
        $today = Carbon::today()->toDateString();

        return DB::transaction(function () use ($employee, $source, $remarks, $today) {
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->lockForUpdate()
                ->first();

            if (!$attendance || !$attendance->check_in) {
                throw new Exception('No check-in record found for today. Please check in first.');
            }
            if ($attendance->check_out) {
                throw new Exception('Already checked out today at ' . $attendance->check_out . '.');
            }

            $now = Carbon::now();
            $checkIn = Carbon::parse($attendance->date . ' ' . $attendance->check_in);
            // check-in was before "now" always in the same real-world sense; if the
            // parsed check-in ends up after now (shouldn't normally happen) treat
            // total minutes as 0 rather than a negative number.
            $totalMinutes = max(0, $checkIn->diffInMinutes($now, false));

            $shift = $attendance->shift ?? $this->resolveShift($employee);
            $earlyLeavingMinutes = 0;
            $overtimeHours = 0;

            if ($shift) {
                [, $shiftEnd] = $this->shiftWindow($shift, $checkIn);

                if ($now->lt($shiftEnd)) {
                    $earlyLeavingMinutes = $now->diffInMinutes($shiftEnd);
                } elseif ($now->gt($shiftEnd)) {
                    $overtimeHours = round($shiftEnd->diffInMinutes($now) / 60, 2);
                }
            }

            $attendance->fill([
                'check_out'              => $now->format('H:i:s'),
                'total_working_minutes'  => $totalMinutes,
                'early_leaving_minutes'  => $earlyLeavingMinutes,
                'overtime_hours'         => $overtimeHours,
                'remarks'                => $remarks ?? $attendance->remarks,
            ])->save();

            return $attendance;
        });
    }

    /**
     * HR/Admin manually creating or correcting a day's attendance —
     * covers Present/Absent/Late/Leave/Holiday/Weekend all in one place.
     */
    public function manualMark(array $data): Attendance
    {
        $employee = Employee::findOrFail($data['employee_id']);
        $shift = $this->resolveShift($employee);

        return DB::transaction(function () use ($employee, $shift, $data) {
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $data['date'])
                ->lockForUpdate()
                ->first() ?? new Attendance(['employee_id' => $employee->id, 'date' => $data['date']]);

            $payload = [
                'shift_id' => $shift?->id,
                'status'   => $data['status'],
                'source'   => 'manual',
                'remarks'  => $data['remarks'] ?? null,
                'entry_by' => Auth::id(),
            ];

            // Only attendable statuses carry real check-in/out & derived timings.
            if (in_array($data['status'], ['Present', 'Late']) && !empty($data['check_in'])) {
                $checkIn = Carbon::parse($data['date'] . ' ' . $data['check_in']);
                $payload['check_in'] = $checkIn->format('H:i:s');

                $lateMinutes = 0;
                if ($shift) {
                    [$shiftStart] = $this->shiftWindow($shift, $checkIn);
                    $graceLimit = $shiftStart->copy()->addMinutes($shift->grace_minutes ?? 0);
                    if ($checkIn->gt($graceLimit)) {
                        $lateMinutes = $shiftStart->diffInMinutes($checkIn);
                    }
                }
                $payload['late_minutes'] = $lateMinutes;
                $payload['status'] = $lateMinutes > 0 ? 'Late' : 'Present';

                if (!empty($data['check_out'])) {
                    $checkOut = Carbon::parse($data['date'] . ' ' . $data['check_out']);
                    // check-out time-only input crossing midnight (night shift) —
                    // if it numerically falls before check-in, assume next day.
                    if ($checkOut->lessThanOrEqualTo($checkIn)) {
                        $checkOut->addDay();
                    }
                    $payload['check_out'] = $checkOut->format('H:i:s');
                    $payload['total_working_minutes'] = max(0, $checkIn->diffInMinutes($checkOut));

                    if ($shift) {
                        [, $shiftEnd] = $this->shiftWindow($shift, $checkIn);
                        $payload['early_leaving_minutes'] = $checkOut->lt($shiftEnd) ? $checkOut->diffInMinutes($shiftEnd) : 0;
                        $payload['overtime_hours'] = $checkOut->gt($shiftEnd) ? round($shiftEnd->diffInMinutes($checkOut) / 60, 2) : 0;
                    }
                }
            } else {
                // Absent / Leave / Holiday / Weekend — no punch times.
                $payload['check_in'] = null;
                $payload['check_out'] = null;
                $payload['late_minutes'] = 0;
                $payload['early_leaving_minutes'] = 0;
                $payload['overtime_hours'] = 0;
                $payload['total_working_minutes'] = 0;
            }

            $attendance->fill($payload)->save();

            return $attendance;
        });
    }

    /**
     * Auto-mark every active employee who has NO attendance record for the
     * given date as 'Absent'. Intended to be run once daily (end of day) via
     * a scheduled command — without this, employees who never punch in and
     * whom HR forgets to mark simply vanish from every bucket in
     * monthlySummary(), silently under-counting absent_days.
     *
     * Skips employees whose weekly off day or a holiday falls on this date,
     * if that information is available (see isOffDay()).
     *
     * Returns how many records were created.
     */
    public function markAbsentees(Carbon $date): int
    {
        $dateString = $date->toDateString();
        $marked = 0;

        Employee::where('status', 1) // active employees only
            ->whereDoesntHave('attendances', fn ($q) => $q->where('date', $dateString))
            ->chunkById(200, function ($employees) use ($dateString, &$marked) {
                foreach ($employees as $employee) {
                    if ($this->isOffDay($employee, Carbon::parse($dateString))) {
                        continue;
                    }

                    // Don't mark absent before the employee even joined.
                    if ($employee->joining_date && Carbon::parse($employee->joining_date)->gt(Carbon::parse($dateString))) {
                        continue;
                    }

                    Attendance::create([
                        'employee_id' => $employee->id,
                        'date'        => $dateString,
                        'shift_id'    => $this->resolveShift($employee)?->id,
                        'status'      => 'Absent',
                        'source'      => 'system',
                        'remarks'     => 'Auto-marked: no check-in recorded.',
                    ]);
                    $marked++;
                }
            });

        return $marked;
    }

    /**
     * Whether a given date is an off-day (weekly off or holiday) for this
     * employee. Uses App\Models\Holiday and an employee 'weekly_off_day'
     * column IF they exist in the app; otherwise always returns false so
     * behaviour degrades gracefully rather than erroring on missing schema.
     *
     * To fully automate Weekend/Holiday status, add:
     *   - a `weekly_off_day` column on employees (or branches), e.g. 'Friday'
     *   - a `holidays` table/model with a `date` column
     * and this method will pick them up automatically.
     */
    protected function isOffDay(Employee $employee, Carbon $date): bool
    {
        // Weekly off day, if the column exists on the employees table.
        if (Schema::hasColumn('employees', 'weekly_off_day') && $employee->weekly_off_day) {
            if (strtolower($date->format('l')) === strtolower($employee->weekly_off_day)) {
                return true;
            }
        }

        // Company/branch holiday calendar (Holiday model now exists).
        if (class_exists(\App\Models\Holiday::class)) {
            if (\App\Models\Holiday::fallsOn($date->toDateString(), $employee->branch_id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Monthly roll-up used by Payroll::create() to auto-fill the attendance
     * fields on the salary generation form.
     *
     * Now proration-aware: if the employee joined or resigned mid-month,
     * total_days/working_days only counts the days they were actually
     * employed, so payroll doesn't divide by days they were never on the
     * payroll for.
     *
     * NOTE: until the Leave module exists, every 'Leave' status record is
     * counted as leave_with_pay — there's no way yet to distinguish paid vs
     * unpaid leave. Revisit this once leave_request_id is actually wired up.
     */
    public function monthlySummary(int $employeeId, int $year, int $month): array
    {
        $employee = Employee::findOrFail($employeeId);

        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        // NOTE: startOfDay() here (not endOfMonth()) is deliberate. endOfMonth()
        // sets the time to 23:59:59.999999 — one microsecond before the next
        // midnight, not midnight itself. Since periodStart is normalized to
        // startOfDay() (00:00:00.000000), diffing an exact midnight against an
        // "almost midnight" instant produces a near-integer float like
        // 20.999999999988425 instead of a clean 21. We only ever care about
        // whole calendar days here, so both ends of the period are normalized
        // to startOfDay() and diffInDays() + 1 gives an exact day count.
        $monthEnd = $monthStart->copy()->endOfMonth()->startOfDay();

        // Clip the period to joining_date / resignation_date so an employee
        // who joined on the 20th isn't charged for the 19 days before they
        // were even employed.
        $periodStart = $monthStart->copy();
        if ($employee->joining_date) {
            $joining = Carbon::parse($employee->joining_date)->startOfDay();
            if ($joining->gt($periodStart)) {
                $periodStart = $joining;
            }
        }

        $periodEnd = $monthEnd->copy();
        $resignationDate = $employee->resignation_date ?? $employee->termination_date ?? null;
        if ($resignationDate) {
            $resignation = Carbon::parse($resignationDate)->startOfDay();
            if ($resignation->lt($periodEnd)) {
                $periodEnd = $resignation;
            }
        }

        // Employee joined after this month, or resigned before it started.
        if ($periodStart->gt($periodEnd)) {
            return [
                'total_days'        => 0,
                'working_days'      => 0,
                'present_days'      => 0,
                'absent_days'       => 0,
                'leave_with_pay'    => 0,
                'leave_without_pay' => 0,
                'late_days'         => 0,
            ];
        }

        $totalDays = $periodStart->diffInDays($periodEnd) + 1;

        $records = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->get()
            ->keyBy(fn ($r) => Carbon::parse($r->date)->toDateString());

        $presentDays = $records->whereIn('status', ['Present', 'Late'])->count();
        $lateDays = $records->where('status', 'Late')->count();
        $absentDays = $records->where('status', 'Absent')->count();
        $leaveDays = $records->where('status', 'Leave')->count();

        // Off-days (Weekend/Holiday) are derived primarily from the calendar
        // (weekly_off_day + Holiday table) — markAbsentees() deliberately
        // skips creating attendance rows on these days, so relying only on
        // explicit 'Holiday'/'Weekend' records would undercount them. If an
        // employee actually has an attendance record on what would otherwise
        // be their off day (e.g. they were called in and marked Present),
        // that day is NOT double counted as off.
        $offDays = 0;
        $cursor = $periodStart->copy();
        while ($cursor->lte($periodEnd)) {
            $dateKey = $cursor->toDateString();
            $existingRecord = $records->get($dateKey);

            if ($existingRecord) {
                if (in_array($existingRecord->status, ['Holiday', 'Weekend'])) {
                    $offDays++;
                }
                // else: employee has a real attendance status that day
                // (Present/Late/Absent/Leave) — don't also count it as off,
                // even if the calendar says it's their weekly off/holiday.
            } elseif ($this->isOffDay($employee, $cursor)) {
                $offDays++;
            }

            $cursor->addDay();
        }

        return [
            'total_days'        => $totalDays,
            'working_days'      => max(0, $totalDays - $offDays),
            'present_days'      => $presentDays,
            'absent_days'       => $absentDays,
            'leave_with_pay'    => $leaveDays,
            'leave_without_pay' => 0,
            'late_days'         => $lateDays,
        ];
    }
}