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
}