<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * GET /attendances — daily register, filterable by date/department/status
     */
    public function index(Request $request)
    {
        $date = $request->input('date', now()->toDateString());

        $query = Attendance::with(['employee.department', 'shift'])->where('date', $date);
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('department_id')) {
            $query->whereHas('employee', fn ($q) => $q->where('department_id', $request->department_id));
        }

        return Inertia::render('Attendance/Index', [
            'attendances' => $query->get(),
            'employees'   => Employee::where('status', 1)->with('shift')->get(['id', 'first_name', 'last_name', 'employee_id', 'department_id', 'shift_id']),
            'shifts'      => Shift::where('is_active', true)->get(),
            'filters'     => $request->only(['date', 'status', 'department_id']),
            'auth'        => ['user' => Auth::user()],
        ]);
    }

    /**
     * POST /attendances — HR/admin manual mark for one employee/date
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'status'      => 'required|in:Present,Absent,Late,Leave,Holiday,Weekend',
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i|after:check_in',
            'remarks'     => 'nullable|string',
        ]);

        try {
            $this->attendanceService->manualMark($request->all());
            return redirect()->back()->with('success', 'Attendance saved.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * PUT /attendances/{attendance} — edit an existing day's record
     */
    public function update(Request $request, Attendance $attendance)
    {
        $request->validate([
            'status'    => 'required|in:Present,Absent,Late,Leave,Holiday,Weekend',
            'check_in'  => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'remarks'   => 'nullable|string',
        ]);

        try {
            $this->attendanceService->manualMark(array_merge($request->all(), [
                'employee_id' => $attendance->employee_id,
                'date'        => $attendance->date->toDateString(),
            ]));
            return redirect()->back()->with('success', 'Attendance updated.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * DELETE /attendances/{attendance}
     */
    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return redirect()->back()->with('success', 'Attendance record removed.');
    }

    /**
     * POST /attendances/check-in — employee self-service (fallback when biometric fails)
     */
    public function checkIn(Request $request)
    {
        $employee = Employee::where('user_id', Auth::id())->firstOrFail();

        try {
            $attendance = $this->attendanceService->checkIn(
                $employee,
                'self',
                $request->ip(),
                $request->input('device_id'),
                $request->input('remarks')
            );
            return redirect()->back()->with('success', 'Checked in at ' . $attendance->check_in);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * POST /attendances/check-out — employee self-service
     */
    public function checkOut(Request $request)
    {
        $employee = Employee::where('user_id', Auth::id())->firstOrFail();

        try {
            $attendance = $this->attendanceService->checkOut($employee, 'self', $request->input('remarks'));
            return redirect()->back()->with('success', 'Checked out at ' . $attendance->check_out);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * GET /attendances/summary/{employee}/{year}/{month} — used by Payroll::create()
     * to auto-fill present/absent/leave/late days on the generation form.
     */
    public function monthlySummary($employee, $year, $month)
    {
        return response()->json(
            $this->attendanceService->monthlySummary((int) $employee, (int) $year, (int) $month)
        );
    }
}
