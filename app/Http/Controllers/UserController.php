<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_id', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search'])
        ]);
    }

    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => ['Admin', 'Manager', 'Operator'], 
            'departments' => ['IT', 'HR', 'Remittance', 'Accounts'],
            'branches' => ['Dhaka Main Branch', 'Chittagong Branch', 'Sylhet Branch']
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:20',
            'employee_id' => 'required|string|max:50|unique:users,employee_id',
            'department' => 'required|string',
            'branch' => 'required|string',
            'role' => 'required|string',
            'designation' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'employee_id' => $request->employee_id,
            'department' => $request->department,
            'branch' => $request->branch,
            'role' => $request->role,
            'designation' => $request->designation,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => ['Admin', 'Manager', 'Operator'],
            'departments' => ['IT', 'HR', 'Remittance', 'Accounts'],
            'branches' => ['Dhaka Main Branch', 'Chittagong Branch', 'Sylhet Branch']
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'required|string|max:20',
            'employee_id' => 'required|string|max:50|unique:users,employee_id,'.$user->id,
            'department' => 'required|string',
            'branch' => 'required|string',
            'role' => 'required|string',
            'designation' => 'required|string',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update($request->except(['password', 'password_confirmation']));

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}