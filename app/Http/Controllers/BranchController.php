<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        // সার্চ লজিক
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('branch_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // স্ট্যাটাস ফিল্টার
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $branches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Branches/Index', [
            'branches' => $branches,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Branches/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'branch_code' => 'required|string|max:20|unique:branches,branch_code',
            'name' => 'required|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'status' => 'required|in:0,1,2',
        ]);

        DB::transaction(function () use ($request) {
            Branch::create([
                'branch_code' => $request->branch_code,
                'name' => $request->name,
                'address' => $request->address,
                'phone' => $request->phone,
                'email' => $request->email,
                'entry_by' => auth()->id(),
                'status' => $request->status,
            ]);
        });

        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function edit(Branch $branch)
    {
        return Inertia::render('Branches/Edit', [
            'branch' => $branch
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        $request->validate([
            'branch_code' => ['required', 'string', 'max:20', Rule::unique('branches')->ignore($branch->id)],
            'name' => 'required|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'status' => 'required|in:0,1,2',
        ]);

        DB::transaction(function () use ($request, $branch) {
            $branch->update([
                'branch_code' => $request->branch_code,
                'name' => $request->name,
                'address' => $request->address,
                'phone' => $request->phone,
                'email' => $request->email,
                'status' => $request->status,
            ]);
        });

        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        // ডিলিট করার আগে চেক করা যে এই ব্রাঞ্চের আন্ডারে কোন ডিপার্টমেন্ট আছে কিনা
        if ($branch->departments()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete branch. It has active departments assigned.');
        }

        $branch->delete();
        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}