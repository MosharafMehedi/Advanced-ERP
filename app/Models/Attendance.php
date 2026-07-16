<?php

namespace App\Models;

use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'shift_id', 'date', 'check_in', 'check_out', 'status',
        'late_minutes', 'early_leaving_minutes', 'overtime_hours', 'total_working_minutes',
        'source', 'ip_address', 'device_id', 'remarks', 'leave_request_id', 'entry_by',
    ];

    protected $casts = [
        'date'            => 'date:Y-m-d',
        'overtime_hours'  => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'entry_by');
    }
}
