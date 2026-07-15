<?php

namespace App\Http\Controllers;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\SalaryStructure;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    /**
     * Display generated payroll list
     * GET /payrolls
     */
    public function index(Request $request)
    {
        $query = Payroll::with(['employee.department', 'employee.designation', 'processor']);

        if ($request->filled('year')) $query->where('year', $request->year);
        if ($request->filled('month')) $query->where('month', $request->month);
        if ($request->filled('status')) $query->where('status', $request->status);

        return Inertia::render('Payroll/Index', [
            'payrolls' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['year', 'month', 'status']),
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Show payroll generation form
     * GET /payrolls/create
     */
    public function create()
    {
        return Inertia::render('Payroll/Create', [
            'employees' => Employee::where('status', 1)
                ->whereHas('salaryStructure')
                ->get(['id', 'first_name', 'last_name', 'employee_id', 'gross_salary']),
            'auth' => [
                'user' => Auth::user(), // Layout যাতে ভেঙে না যায়
            ],
        ]);
    }

    /**
     * Store / Generate Payroll
     * POST /payrolls
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id'       => 'required|exists:employees,id',
            'year'              => 'required|integer|min:2020|max:2050',
            'month'             => 'required|integer|min:1|max:12',
            'total_days'        => 'required|integer|min:28|max:31',
            'working_days'      => 'required|integer|min:0',
            'present_days'      => 'required|integer|min:0',
            'absent_days'       => 'nullable|integer|min:0',
            'leave_with_pay'    => 'nullable|integer|min:0',
            'leave_without_pay' => 'nullable|integer|min:0',
            'late_days'         => 'nullable|integer|min:0',
            'bonus'             => 'nullable|numeric|min:0',
            'arrears'           => 'nullable|numeric|min:0',
            'fine'              => 'nullable|numeric|min:0',
            'loan_deduction'    => 'nullable|numeric|min:0',
        ]);

        try {
            $employee = Employee::findOrFail($request->employee_id);
            
            $this->payrollService->calculateSalary(
                $employee,
                $request->year,
                $request->month,
                $request->all()
            );

            return redirect()->route('payrolls.index')->with('success', 'Salary generated successfully for ' . $employee->full_name);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show single Salary Slip Details
     * GET /payrolls/{payroll}
     */
    public function show(Payroll $payroll)
    {
        $payroll->load(['employee.department', 'employee.designation', 'details', 'processor', 'approver']);

        return Inertia::render('Payroll/Show', [
            'payroll' => $payroll,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * GET /payrolls/{payroll}/edit (স্যালারি স্ট্রাকচার সেটিংস পেজ)
     */
    public function edit($id)
    {
        return Inertia::render('Payroll/Structure', [
            'employees' => Employee::with('salaryStructure')
                ->where('status', 1)
                ->get(['id', 'first_name', 'last_name', 'employee_id', 'gross_salary']),
            'auth' => [
                'user' => Auth::user(), // Layout প্রপ্স সচল রাখার জন্য
            ],
        ]);
    }

    /**
     * RESOURCE UPDATE: স্ট্রাকচার আপডেট, অ্যাপ্রুভ এবং পেমেন্ট রিলিজ
     * PUT/PATCH /payrolls/{payroll}
     */
    public function update(Request $request, $id)
    {
        $action = $request->input('action');

        // 🎯 ১. স্যালারি স্ট্রাকচার সেভ বা আপডেট করার সঠিক লজিক (মডেল সংশোধন করা হয়েছে)
        if ($action === 'salary_structure') {
            $request->validate([
                'employee_id'               => 'required|exists:employees,id',
                'basic_percentage'          => 'required|numeric|min:0|max:100',
                'house_rent_percentage'     => 'required|numeric|min:0|max:100',
                'medical_percentage'        => 'required|numeric|min:0|max:100',
                'conveyance_percentage'     => 'required|numeric|min:0|max:100',
                'fixed_allowance'           => 'nullable|numeric|min:0',
                'mobile_allowance'          => 'nullable|numeric|min:0',
                'internet_allowance'        => 'nullable|numeric|min:0',
                'provident_fund_percentage' => 'nullable|numeric|min:0|max:100',
                'tax_deduction_fixed'       => 'nullable|numeric|min:0',
            ]);

            // ✅ এখানে Payroll এর জায়গায় SalaryStructure ব্যবহার করা হয়েছে
            SalaryStructure::updateOrCreate(
                ['employee_id' => $request->employee_id],
                array_merge($request->all(), [
                    'created_by' => Auth::id(),
                    'updated_by' => Auth::id(),
                ])
            );

            return redirect()->back()->with('success', 'Salary structure updated successfully.');
        }

        // বাকি লজিকগুলোর জন্য ডাটাবেজ থেকে নির্দিষ্ট স্লিপ রেকর্ডটি খুঁজে নিবে
        $payroll = Payroll::findOrFail($id);

        // ২. স্যালারি অনুমোদন (Approve) লজিক
        if ($action === 'approve') {
            $payroll->update([
                'status' => 'Approved',
                'approved_by' => Auth::id(),
            ]);

            return redirect()->back()->with('success', 'Payroll has been approved.');
        }

        // ৩. স্যালারি পেমেন্ট/রিলিজ (Pay) লজিক
        if ($action === 'pay') {
            $request->validate([
                'payment_method' => 'required|in:Bank Transfer,Cash,Cheque,Mobile Banking',
                'payment_date'   => 'required|date',
                'transaction_reference' => 'nullable|string',
            ]);

            $payroll->update([
                'status' => 'Paid',
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'transaction_reference' => $request->transaction_reference,
            ]);

            return redirect()->back()->with('success', 'Salary released/paid successfully.');
        }

        return redirect()->back()->withErrors(['error' => 'Invalid action requested.']);
    }

    /**
     * Delete Salary Slip
     * DELETE /payrolls/{payroll}
     */
    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return redirect()->route('payrolls.index')->with('success', 'Salary slip deleted successfully.');
    }
}