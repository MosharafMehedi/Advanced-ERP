<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\LeaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    protected $leaveService;

    public function __construct(LeaveService $leaveService)
    {
        $this->leaveService = $leaveService;
    }

    /**
     * GET /leave-requests
     * HR/Admin see everyone's requests; a regular employee sees only their own.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $viewingEmployee = Employee::where('user_id', $user->id)->first();

        $query = LeaveRequest::with(['employee', 'leaveType', 'manager']);

        $isHrOrAdmin = in_array($user->role_id, [1, 2]); // adjust to your actual HR/Admin role IDs

        if (!$isHrOrAdmin && $viewingEmployee) {
            $query->where('employee_id', $viewingEmployee->id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $year = $request->input('year', now()->year);

        $balanceSummary = $viewingEmployee
            ? $this->leaveService->balanceSummary($viewingEmployee->id, (int) $year)
            : ($isHrOrAdmin ? $this->leaveService->orgBalanceSummary((int) $year) : null);

        return Inertia::render('Leave/Index', [
            'requests'      => $query->latest()->paginate(15)->withQueryString(),
            'leaveTypes'    => LeaveType::where('is_active', true)->get(),
            'balanceSummary'=> $balanceSummary,
            'isHrOrAdmin'   => $isHrOrAdmin,
            'filters'       => $request->only(['status', 'year']),
            'auth'          => ['user' => $user],
        ]);
    }

    /**
     * POST /leave-requests — employee submits a new request
     */
    public function store(Request $request)
    {
        $request->validate([
            'leave_type_id'   => 'required|exists:leave_types,id',
            'start_date'      => 'required|date',
            'end_date'        => 'required|date|after_or_equal:start_date',
            'is_half_day'     => 'boolean',
            'half_day_period' => 'nullable|in:Morning,Afternoon|required_if:is_half_day,true',
            'reason'          => 'nullable|string|max:500',
        ]);

        try {
            $employee = Employee::where('user_id', Auth::id())->firstOrFail();
            $this->leaveService->requestLeave(
                $employee,
                $request->leave_type_id,
                $request->start_date,
                $request->end_date,
                $request->reason,
                (bool) $request->is_half_day,
                $request->half_day_period
            );
            return redirect()->back()->with('success', 'Leave request submitted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * PUT /leave-requests/{leaveRequest}/manager-action
     */
    public function managerAction(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'decision' => 'required|in:approve,reject',
            'remarks'  => 'nullable|string|max:255',
        ]);

        try {
            $this->leaveService->managerAction($leaveRequest, $request->decision, $request->remarks);
            return redirect()->back()->with('success', 'Decision recorded.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * PUT /leave-requests/{leaveRequest}/hr-action
     */
    public function hrAction(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'decision' => 'required|in:approve,reject',
            'remarks'  => 'nullable|string|max:255',
        ]);

        try {
            $this->leaveService->hrAction($leaveRequest, $request->decision, $request->remarks);
            return redirect()->back()->with('success', 'Decision recorded.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * PUT /leave-requests/{leaveRequest}/cancel
     */
    public function cancel(LeaveRequest $leaveRequest)
    {
        try {
            $this->leaveService->cancel($leaveRequest);
            return redirect()->back()->with('success', 'Leave request cancelled.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}