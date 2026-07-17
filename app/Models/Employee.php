<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'joining_date' => 'date:Y-m-d',
        'confirmation_date' => 'date:Y-m-d',
        'resignation_date' => 'date:Y-m-d',
        'termination_date' => 'date:Y-m-d',
        'date_of_birth' => 'date:Y-m-d',
        'has_login_access' => 'boolean',
        'basic_salary' => 'decimal:2',
        'gross_salary' => 'decimal:2',
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reporting_manager_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($employee) {
            if (empty($employee->employee_id)) {
                $employee->employee_id = self::generateEmployeeId();
            }
        });
    }

    public static function generateEmployeeId()
    {
        $year = date('Y');
        $prefix = "EMP-{$year}-";

        $lastEmployee = self::where('employee_id', 'like', "{$prefix}%")
            ->orderBy('employee_id', 'desc')
            ->first();

        if ($lastEmployee) {
            $lastNumber = (int) substr($lastEmployee->employee_id, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function salaryStructure(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(SalaryStructure::class, 'employee_id');
    }

    public function payrolls(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payroll::class, 'employee_id');
    }


public function shift(): BelongsTo
{
    return $this->belongsTo(Shift::class);
}
}
