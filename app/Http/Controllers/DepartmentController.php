<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::with(['branch:id,name', 'deptHead:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('department_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $departments = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Departments/Create', [
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'department_code' => 'required|string|max:20|unique:departments,department_code',
            'name' => 'required|string|max:100',
            'branch_id' => 'nullable|exists:branches,id',
            'dept_head_id' => 'nullable|exists:users,id',
            'status' => 'required|in:0,1,2',
        ]);

        DB::transaction(function () use ($request) {
            Department::create([
                'department_code' => $request->department_code,
                'name' => $request->name,
                'branch_id' => $request->branch_id,
                'dept_head_id' => $request->dept_head_id,
                'entry_by' => auth()->id(), // অটোমেটিক কারেন্ট লগইনড আইডি বসে যাবে
                'status' => $request->status,
            ]);
        });

        return redirect()->route('departments.index')->with('success', 'Department created successfully.');
    }

    public function edit(Department $department)
    {
        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'branches' => Branch::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get()
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $request->validate([
            'department_code' => ['required', 'string', 'max:20', Rule::unique('departments')->ignore($department->id)],
            'name' => 'required|string|max:100',
            'branch_id' => 'nullable|exists:branches,id',
            'dept_head_id' => 'nullable|exists:users,id',
            'status' => 'required|in:0,1,2',
        ]);

        DB::transaction(function () use ($request, $department) {
            $department->update([
                'department_code' => $request->department_code,
                'name' => $request->name,
                'branch_id' => $request->branch_id,
                'dept_head_id' => $request->dept_head_id,
                'status' => $request->status,
            ]);
        });

        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }
}