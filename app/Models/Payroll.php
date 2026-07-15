<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payroll extends Model
{
    use HasFactory;

    protected $table = 'salary_slips';

    protected $fillable = [
        'salary_slip_no',
        'employee_id',
        'year',
        'month',
        'total_days',
        'working_days',
        'present_days',
        'absent_days',
        'leave_with_pay',
        'leave_without_pay',
        'late_days',
        'gross_salary',
        'total_earnings',
        'total_deductions',
        'net_payable',
        'status',
        'payment_method',
        'payment_date',
        'bank_name',
        'bank_branch_name',
        'bank_account_no',
        'transaction_reference',
        'processed_by',
        'approved_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'gross_salary' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_payable' => 'decimal:2',
    ];

    // Relationships
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(SalarySlipDetail::class, 'salary_slip_id');
    }

    public function earnings()
    {
        return $this->details()->where('type', 'earnings');
    }

    public function deductions()
    {
        return $this->details()->where('type', 'deductions');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}


class SalaryStructure extends Model
{
    use HasFactory;

    protected $table = 'salary_structures';

    protected $fillable = [
        'employee_id',
        'basic_percentage',
        'house_rent_percentage',
        'medical_percentage',
        'conveyance_percentage',
        'fixed_allowance',
        'mobile_allowance',
        'internet_allowance',
        'provident_fund_percentage',
        'tax_deduction_fixed',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'basic_percentage' => 'decimal:2',
        'house_rent_percentage' => 'decimal:2',
        'medical_percentage' => 'decimal:2',
        'conveyance_percentage' => 'decimal:2',
        'fixed_allowance' => 'decimal:2',
        'mobile_allowance' => 'decimal:2',
        'internet_allowance' => 'decimal:2',
        'provident_fund_percentage' => 'decimal:2',
        'tax_deduction_fixed' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}


class SalarySlipDetail extends Model
{
    use HasFactory;

    protected $table = 'salary_slip_details';

    protected $fillable = [
        'salary_slip_id',
        'type',
        'component_name',
        'amount',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function salarySlip(): BelongsTo
    {
        return $this->belongsTo(Payroll::class, 'salary_slip_id');
    }
}