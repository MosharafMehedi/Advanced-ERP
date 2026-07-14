<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['branch', 'department', 'designation', 'manager', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('employee_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('branch_id')) $query->where('branch_id', $request->branch_id);
        if ($request->filled('department_id')) $query->where('department_id', $request->department_id);
        if ($request->filled('status')) $query->where('status', $request->status);

        return Inertia::render('Employees/Index', [
            'employees' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'branch_id', 'department_id', 'status']),
            'branches' => Branch::where('status', 1)->get(['id', 'name']),
            'departments' => Department::where('status', 1)->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Employees/Create', [
            'branches'     => Branch::where('status', 1)->get(['id', 'name']),
            'departments'  => Department::where('status', 1)->get(['id', 'name']),
            'designations' => Designation::where('status', 1)->get(['id', 'title']),
            'managers'     => Employee::where('status', 1)->get(['id', 'first_name', 'last_name', 'employee_id']),
            'users'        => User::doesntHave('employee')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store updated with Auto-User Creation Logic
     */
    public function store(Request $request)
    {
        // ফ্রন্টএন্ডের চেকবক্স ট্রু/ফলস ফিল্টার করার জন্য রিকোয়েস্ট ফরম্যাট ফিক্সিং
        $request->merge([
            'has_login_access' => filter_var($request->has_login_access, FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            // Personal Information
            'employee_id'               => 'required|string|unique:employees,employee_id',
            'first_name'                => 'required|string|max:100',
            'last_name'                 => 'nullable|string|max:100',
            'gender'                    => 'required|in:Male,Female,Other',
            'date_of_birth'             => 'nullable|date',
            'blood_group'               => 'nullable|string|max:10',
            'marital_status'            => 'nullable|in:Single,Married,Divorced,Widowed',
            'father_name'               => 'nullable|string|max:150',
            'mother_name'               => 'nullable|string|max:150',
            'national_id'               => 'nullable|string|max:30',
            'nationality'               => 'required|string|max:50',
            'religion'                  => 'nullable|string|max:50',
            'email'                     => 'nullable|email|unique:employees,email',
            'phone'                     => 'nullable|string|max:20',
            'alternative_phone'         => 'nullable|string|max:20',
            'present_address'           => 'nullable|string',
            'permanent_address'         => 'nullable|string',
            'emergency_contact_name'    => 'nullable|string|max:100',
            'emergency_contact_phone'   => 'nullable|string|max:20',
            'emergency_contact_relation'=> 'nullable|string|max:50',

            // Office Placement & HR
            'branch_id'                 => 'nullable|exists:branches,id',
            'department_id'             => 'nullable|exists:departments,id',
            'designation_id'            => 'nullable|exists:designations,id',
            'reporting_manager_id'      => 'nullable|exists:employees,id',
            'employment_type'           => 'required|in:Permanent,Contract,Intern,Part Time',
            'joining_date'              => 'nullable|date',
            'confirmation_date'         => 'nullable|date',
            'termination_date'          => 'nullable|date',
            'status'                    => 'required|in:0,1,2,3',
            
            // Financial & Credentials
            'has_login_access'          => 'required|boolean',
            'user_id'                   => 'nullable|exists:users,id|unique:employees,user_id',
            'basic_salary'              => 'nullable|numeric|min:0',
            'gross_salary'              => 'nullable|numeric|min:0',
            
            // Files
            'profile_photo'             => 'nullable|image|max:2048',
            'nid_file'                  => 'nullable|mimes:jpeg,png,jpg,pdf|max:3072',
            'cv_file'                   => 'nullable|mimes:pdf,doc,docx|max:5120',
        ]);

        $data = $validated;
        $data['employee_id'] = strtoupper($validated['employee_id']);
        $data['full_name'] = trim($request->first_name . ' ' . $request->last_name);
        $data['created_by'] = Auth::id();

        // ১. অটো ইউজার ক্রিয়েশন লজিক (যদি login access ট্রু থাকে কিন্তু ইউজার আইডি না পাঠানো হয়)
        if ($data['has_login_access'] && empty($data['user_id'])) {
            // ইমেইল না থাকলে Employee ID দিয়ে সিস্টেম ইমেইল জেনারেট হবে
            $email = $request->email ?? strtolower($data['employee_id']) . '@company.com';
            
            // ইউজার অলরেডি এক্সিস্ট করে কিনা চেক
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                return redirect()->back()->withErrors(['email' => 'User account already exists with this email stream.']);
            }

            $newUser = User::create([
                'name' => $data['full_name'],
                'email' => $email,
                'password' => Hash::make('12345678'), // ডিফল্ট পাসওয়ার্ড
            ]);
            $data['user_id'] = $newUser->id;
        }

        // ২. ফাইল আপলোড প্রসেস
        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('employees/photos', 'public');
        }
        if ($request->hasFile('nid_file')) {
            $data['nid_file'] = $request->file('nid_file')->store('employees/documents', 'public');
        }
        if ($request->hasFile('cv_file')) {
            $data['cv_file'] = $request->file('cv_file')->store('employees/documents', 'public');
        }

        Employee::create($data);

        return redirect()->route('employees.index')->with('success', 'Employee profile created successfully.');
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('Employees/Edit', [
            'employee'     => $employee,
            'branches'     => Branch::where('status', 1)->get(['id', 'name']),
            'departments'  => Department::where('status', 1)->get(['id', 'name']),
            'designations' => Designation::where('status', 1)->get(['id', 'title']),
            'managers'     => Employee::where('id', '!=', $employee->id)->where('status', 1)->get(['id', 'first_name', 'last_name', 'employee_id']),
            'users'        => User::where(function($q) use ($employee) {
                                $q->doesntHave('employee')->orWhere('id', $employee->user_id);
                             })->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update fixed with existing file persistence
     */
    public function update(Request $request, Employee $employee)
    {
        $request->merge([
            'has_login_access' => filter_var($request->has_login_access, FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = $request->validate([
            'employee_id'               => 'required|string|unique:employees,employee_id,' . $employee->id,
            'first_name'                => 'required|string|max:100',
            'last_name'                 => 'nullable|string|max:100',
            'gender'                    => 'required|in:Male,Female,Other',
            'date_of_birth'             => 'nullable|date',
            'blood_group'               => 'nullable|string|max:10',
            'marital_status'            => 'nullable|in:Single,Married,Divorced,Widowed',
            'father_name'               => 'nullable|string|max:150',
            'mother_name'               => 'nullable|string|max:150',
            'national_id'               => 'nullable|string|max:30',
            'nationality'               => 'required|string|max:50',
            'religion'                  => 'nullable|string|max:50',
            'email'                     => 'nullable|email|unique:employees,email,' . $employee->id,
            'phone'                     => 'nullable|string|max:20',
            'alternative_phone'         => 'nullable|string|max:20',
            'present_address'           => 'nullable|string',
            'permanent_address'         => 'nullable|string',
            'emergency_contact_name'    => 'nullable|string|max:100',
            'emergency_contact_phone'   => 'nullable|string|max:20',
            'emergency_contact_relation'=> 'nullable|string|max:50',

            'branch_id'                 => 'nullable|exists:branches,id',
            'department_id'             => 'nullable|exists:departments,id',
            'designation_id'            => 'nullable|exists:designations,id',
            'reporting_manager_id'      => 'nullable|exists:employees,id',
            'employment_type'           => 'required|in:Permanent,Contract,Intern,Part Time',
            'joining_date'              => 'nullable|date',
            'confirmation_date'         => 'nullable|date',
            'termination_date'          => 'nullable|date',
            'status'                    => 'required|in:0,1,2,3',
            
            'has_login_access'          => 'required|boolean',
            'user_id'                   => 'nullable|exists:users,id|unique:employees,user_id,' . $employee->id,
            'basic_salary'              => 'nullable|numeric|min:0',
            'gross_salary'              => 'nullable|numeric|min:0',
            
            'profile_photo'             => 'nullable|image|max:2048',
            'nid_file'                  => 'nullable|mimes:jpeg,png,jpg,pdf|max:3072',
            'cv_file'                   => 'nullable|mimes:pdf,doc,docx|max:5120',
        ]);

        $data = $validated;
        $data['employee_id'] = strtoupper($validated['employee_id']);
        $data['full_name'] = trim($request->first_name . ' ' . $request->last_name);
        $data['updated_by'] = Auth::id();

        // আপডেট এ অটো ইউজার হ্যান্ডেলিং
        if ($data['has_login_access'] && empty($data['user_id'])) {
            $email = $request->email ?? strtolower($data['employee_id']) . '@company.com';
            $existingUser = User::where('email', $email)->first();
            
            if (!$existingUser) {
                $newUser = User::create([
                    'name' => $data['full_name'],
                    'email' => $email,
                    'password' => Hash::make('12345678'),
                ]);
                $data['user_id'] = $newUser->id;
            } else {
                $data['user_id'] = $existingUser->id;
            }
        } elseif (!$data['has_login_access']) {
            $data['user_id'] = null; // এক্সেস ফলস করলে রিলেশন ডিটাচ হবে
        }

        // ফাইল রিপ্লেসমেন্ট লজিক
        if ($request->hasFile('profile_photo')) {
            if ($employee->profile_photo) Storage::disk('public')->delete($employee->profile_photo);
            $data['profile_photo'] = $request->file('profile_photo')->store('employees/photos', 'public');
        }
        if ($request->hasFile('nid_file')) {
            if ($employee->nid_file) Storage::disk('public')->delete($employee->nid_file);
            $data['nid_file'] = $request->file('nid_file')->store('employees/documents', 'public');
        }
        if ($request->hasFile('cv_file')) {
            if ($employee->cv_file) Storage::disk('public')->delete($employee->cv_file);
            $data['cv_file'] = $request->file('cv_file')->store('employees/documents', 'public');
        }

        $employee->update($data);

        return redirect()->route('employees.index')->with('success', 'Employee profile updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back();
    }
}