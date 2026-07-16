<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        return Inertia::render('Shift/Index', [
            'shifts' => Shift::withCount('employees')->orderBy('start_time')->get(),
            'auth'   => ['user' => Auth::user()],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i',
            'grace_minutes' => 'nullable|integer|min:0|max:120',
        ]);

        Shift::create($request->all());
        return redirect()->back()->with('success', 'Shift created.');
    }

    public function update(Request $request, Shift $shift)
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i',
            'grace_minutes' => 'nullable|integer|min:0|max:120',
            'is_active'     => 'boolean',
        ]);

        $shift->update($request->all());
        return redirect()->back()->with('success', 'Shift updated.');
    }

    public function destroy(Shift $shift)
    {
        if ($shift->employees()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete a shift that still has employees assigned to it.']);
        }
        $shift->delete();
        return redirect()->back()->with('success', 'Shift deleted.');
    }
}
