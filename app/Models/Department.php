<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_code',
        'name',
        'branch_id',
        'dept_head_id',
        'entry_by',
        'status'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function deptHead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dept_head_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entry_by');
    }
}