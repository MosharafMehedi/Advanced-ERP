<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'slip_no', 'employee_id', 'year', 'month',
        'total_days', 'working_days', 'present_days', 'absent_days',
        'leave_with_pay', 'leave_without_pay', 'late_days',
        'bonus', 'arrears', 'fine', 'loan_deduction',
        'gross_salary', 'total_allowance', 'total_deduction', 'net_payable',
        'status', 'payment_method', 'payment_date',
        'bank_name', 'bank_branch_name', 'bank_account_no', 'transaction_reference',
        'processed_by', 'approved_by',
    ];

    protected $casts = [
        'payment_date'   => 'date',
        'gross_salary'   => 'decimal:2',
        'total_allowance'=> 'decimal:2',
        'total_deduction'=> 'decimal:2',
        'net_payable'    => 'decimal:2',
        'bonus'          => 'decimal:2',
        'arrears'        => 'decimal:2',
        'fine'           => 'decimal:2',
        'loan_deduction' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function details()
    {
        return $this->hasMany(PayrollDetail::class);
    }

    public function processor()
    {
        return $this->belongsTo(\App\Models\User::class, 'processed_by');
    }

    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }
}
