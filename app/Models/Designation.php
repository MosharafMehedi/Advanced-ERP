<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    protected $fillable = [
        'designation_code',
        'title',
        'description',
        'entry_by',
        'status',
    ];

    // Entry By relationship
    public function entryBy()
    {
        return $this->belongsTo(User::class, 'entry_by');
    }
}
