<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'days_per_year', 'is_paid',
        'carry_forward_allowed', 'max_carry_forward_days', 'is_active',
    ];

    protected $casts = [
        'is_paid'                => 'boolean',
        'carry_forward_allowed'  => 'boolean',
        'is_active'               => 'boolean',
        'days_per_year'           => 'decimal:1',
        'max_carry_forward_days'  => 'decimal:1',
    ];

    public function balances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function requests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
