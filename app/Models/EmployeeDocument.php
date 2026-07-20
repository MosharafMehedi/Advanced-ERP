<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EmployeeDocument extends Model
{
    protected $fillable = [
        'employee_id',
        'document_type',
        'title',
        'file_path',
        'file_type',
        'expiry_date',
        'status',
        'notes'
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): string
    {
        return $this->file_path ? Storage::url($this->file_path) : '';
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}