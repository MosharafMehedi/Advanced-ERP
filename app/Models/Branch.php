<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_code',
        'name',
        'address',
        'phone',
        'email',
        'entry_by',
        'status'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entry_by');
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class, 'branch_id');
    }
}