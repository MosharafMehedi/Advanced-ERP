<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'leave_type_id', 'start_date', 'end_date', 'total_days',
        'is_half_day', 'half_day_period', 'reason',
        'status', 'manager_id', 'manager_action_at', 'manager_remarks',
        'approved_by', 'approved_at', 'hr_remarks', 'applied_by',
    ];

    protected $casts = [
        'start_date'        => 'date:Y-m-d',
        'end_date'          => 'date:Y-m-d',
        'total_days'        => 'decimal:1',
        'is_half_day'       => 'boolean',
        'manager_action_at' => 'datetime',
        'approved_at'       => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}