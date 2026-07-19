<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('LeaveType/Index', [
            'leaveTypes' => LeaveType::orderBy('name')->get(),
            'auth'       => ['user' => Auth::user()],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'                    => 'required|string|max:100',
            'code'                    => 'required|string|max:10|unique:leave_types,code',
            'days_per_year'           => 'required|numeric|min:0',
            'is_paid'                 => 'boolean',
            'carry_forward_allowed'   => 'boolean',
            'max_carry_forward_days'  => 'nullable|numeric|min:0',
        ]);

        LeaveType::create($request->all());
        return redirect()->back()->with('success', 'Leave type created.');
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $request->validate([
            'name'                    => 'required|string|max:100',
            'code'                    => 'required|string|max:10|unique:leave_types,code,' . $leaveType->id,
            'days_per_year'           => 'required|numeric|min:0',
            'is_paid'                 => 'boolean',
            'carry_forward_allowed'   => 'boolean',
            'max_carry_forward_days'  => 'nullable|numeric|min:0',
            'is_active'               => 'boolean',
        ]);

        $leaveType->update($request->all());
        return redirect()->back()->with('success', 'Leave type updated.');
    }

    public function destroy(LeaveType $leaveType)
    {
        if ($leaveType->requests()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete a leave type that already has requests against it. Deactivate it instead.']);
        }
        $leaveType->delete();
        return redirect()->back()->with('success', 'Leave type deleted.');
    }
}
