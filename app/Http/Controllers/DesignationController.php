<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DesignationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Designation::query();

        // সার্চ ফিল্টার (Code অথবা Title দিয়ে)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('designation_code', 'like', '%' . $request->search . '%')
                  ->orWhere('title', 'like', '%' . $request->search . '%');
            });
        }

        // স্ট্যাটাস ফিল্টার
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // লেটেস্ট ডেটা আগে দেখাবে এবং পেজিনেট করবে
        $designations = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Designations/Index', [
            'designations' => $designations,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'designation_code' => 'required|string|max:20|unique:designations,designation_code',
            'title'            => 'required|string|max:100',
            'description'      => 'nullable|string',
            'status'           => 'required|in:0,1,2',
        ]);

        // নিজে আপারকেস কনভার্ট করা (নিরাপত্তার জন্য) এবং entry_by সেট করা
        $validated['designation_code'] = strtoupper($validated['designation_code']);
        $validated['entry_by'] = Auth::id();

        Designation::create($validated);

        // মোডাল ক্রুডের জন্য ব্যাক রিডাইরেক্টই যথেষ্ট
        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Designation $designation)
    {
        $validated = $request->validate([
            'designation_code' => 'required|string|max:20|unique:designations,designation_code,' . $designation->id,
            'title'            => 'required|string|max:100',
            'description'      => 'nullable|string',
            'status'           => 'required|in:0,1,2',
        ]);

        $validated['designation_code'] = strtoupper($validated['designation_code']);

        $designation->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Designation $designation)
    {
        try {
            $designation->delete();
            return redirect()->back();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'This designation cannot be deleted because it is assigned to existing records.'
            ]);
        }
    }
}