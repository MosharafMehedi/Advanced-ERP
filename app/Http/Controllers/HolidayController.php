<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $query = Holiday::with('branch');

        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        return Inertia::render('Holidays/Index', [
            'holidays' => $query->orderBy('date')->get(),
            'branches' => Branch::where('status', 1)->get(['id', 'name']),
            'filters'  => $request->only(['year']),
        ]);
    }

    /**
     * Create/Edit modal-এই হ্যান্ডেল হয় (Holidays/Index.jsx), তাই আলাদা কোনো
     * পেজ নেই। Route::resource() পুরোপুরি ব্যবহারের কারণে এই রুটগুলো এমনিতেই
     * রেজিস্টার হয়ে যায় — কেউ ভুলবশত সরাসরি URL হিট করলে যেন 500 error না
     * দেখে, তাই index এ redirect করে দেওয়া হচ্ছে।
     */
    public function create()
    {
        return redirect()->route('holidays.index');
    }

    public function show(Holiday $holiday)
    {
        return redirect()->route('holidays.index');
    }

    public function edit(Holiday $holiday)
    {
        return redirect()->route('holidays.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:150',
            'date'      => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
            'remarks'   => 'nullable|string|max:255',
        ]);

        // একই তারিখে একই শাখার (বা সব-শাখার) জন্য ডুপ্লিকেট ছুটি আটকানো —
        // DB এর unique(['date','branch_id']) constraint এর সাথে সামঞ্জস্যপূর্ণ
        // একটা user-friendly error দেখানোর জন্য।
        $exists = Holiday::whereDate('date', $validated['date'])
            ->where('branch_id', $validated['branch_id'] ?? null)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors(['date' => 'A holiday already exists on this date for the selected branch.']);
        }

        Holiday::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('holidays.index')->with('success', 'Holiday added successfully.');
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:150',
            'date'      => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
            'remarks'   => 'nullable|string|max:255',
        ]);

        $exists = Holiday::whereDate('date', $validated['date'])
            ->where('branch_id', $validated['branch_id'] ?? null)
            ->where('id', '!=', $holiday->id)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors(['date' => 'A holiday already exists on this date for the selected branch.']);
        }

        $holiday->update($validated);

        return redirect()->route('holidays.index')->with('success', 'Holiday updated successfully.');
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return redirect()->back()->with('success', 'Holiday removed.');
    }
}