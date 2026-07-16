<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
     * Employee self check-in, or HR/manager punching it in on their behalf.
     */
    public function checkIn(Employee $employee, string $source = 'self', ?string $ip = null, ?string $deviceId = null, ?string $remarks = null): Attendance
    {
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::firstOrNew(['employee_id' => $employee->id, 'date' => $today]);

        if ($attendance->exists && $attendance->check_in) {
            throw new Exception('Already checked in today at ' . $attendance->check_in . '.');
        }

        $shift = $this->resolveShift($employee);
        $now = Carbon::now();

        $status = 'Present';
        $lateMinutes = 0;

        if ($shift) {
            $shiftStart = Carbon::parse($shift->start_time)->setDateFrom($now);
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
    }

    /**
     * Employee self check-out, or HR/manager punching it out on their behalf.
     */
    public function checkOut(Employee $employee, string $source = 'self', ?string $remarks = null): Attendance
    {
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->check_in) {
            throw new Exception('No check-in record found for today. Please check in first.');
        }
        if ($attendance->check_out) {
            throw new Exception('Already checked out today at ' . $attendance->check_out . '.');
        }

        $now = Carbon::now();
        $checkIn = Carbon::parse($attendance->check_in)->setDateFrom($now);
        $totalMinutes = max(0, $checkIn->diffInMinutes($now));

        $shift = $attendance->shift ?? $this->resolveShift($employee);
        $earlyLeavingMinutes = 0;
        $overtimeHours = 0;

        if ($shift) {
            $shiftEnd = Carbon::parse($shift->end_time)->setDateFrom($now);

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
    }

    /**
     * HR/Admin manually creating or correcting a day's attendance —
     * covers Present/Absent/Late/Leave/Holiday/Weekend all in one place.
     */
    public function manualMark(array $data): Attendance
    {
        $employee = Employee::findOrFail($data['employee_id']);
        $shift = $this->resolveShift($employee);

        $attendance = Attendance::firstOrNew(['employee_id' => $employee->id, 'date' => $data['date']]);

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
                $shiftStart = Carbon::parse($data['date'] . ' ' . $shift->start_time);
                $graceLimit = $shiftStart->copy()->addMinutes($shift->grace_minutes ?? 0);
                if ($checkIn->gt($graceLimit)) {
                    $lateMinutes = $shiftStart->diffInMinutes($checkIn);
                }
            }
            $payload['late_minutes'] = $lateMinutes;
            $payload['status'] = $lateMinutes > 0 ? 'Late' : 'Present';

            if (!empty($data['check_out'])) {
                $checkOut = Carbon::parse($data['date'] . ' ' . $data['check_out']);
                $payload['check_out'] = $checkOut->format('H:i:s');
                $payload['total_working_minutes'] = max(0, $checkIn->diffInMinutes($checkOut));

                if ($shift) {
                    $shiftEnd = Carbon::parse($data['date'] . ' ' . $shift->end_time);
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
    }

    /**
     * Monthly roll-up used by Payroll::create() to auto-fill the attendance
     * fields on the salary generation form.
     *
     * NOTE: until the Leave module exists, every 'Leave' status record is
     * counted as leave_with_pay — there's no way yet to distinguish paid vs
     * unpaid leave. Revisit this once leave_request_id is actually wired up.
     */
    public function monthlySummary(int $employeeId, int $year, int $month): array
    {
        $totalDays = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        $records = Attendance::where('employee_id', $employeeId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();

        $presentDays = $records->whereIn('status', ['Present', 'Late'])->count();
        $lateDays = $records->where('status', 'Late')->count();
        $absentDays = $records->where('status', 'Absent')->count();
        $leaveDays = $records->where('status', 'Leave')->count();
        $offDays = $records->whereIn('status', ['Holiday', 'Weekend'])->count();

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
