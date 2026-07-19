<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id', 'leave_type_id', 'year', 'allocated', 'carried_forward', 'used', 'pending'];

    protected $casts = [
        'allocated'       => 'decimal:1',
        'carried_forward' => 'decimal:1',
        'used'            => 'decimal:1',
        'pending'         => 'decimal:1',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function getRemainingAttribute()
    {
        return round($this->allocated + $this->carried_forward - $this->used - $this->pending, 1);
    }
}
