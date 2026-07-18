<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Holiday extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * একটা নির্দিষ্ট তারিখে (এবং ঐচ্ছিকভাবে নির্দিষ্ট branch এর জন্য) কোনো
     * ছুটি আছে কিনা — branch_id null মানে "সব শাখার জন্য প্রযোজ্য" ছুটি।
     */
    public static function fallsOn(string $date, ?int $branchId = null): bool
    {
        return static::whereDate('date', $date)
            ->where(function ($q) use ($branchId) {
                $q->whereNull('branch_id');
                if ($branchId) {
                    $q->orWhere('branch_id', $branchId);
                }
            })
            ->exists();
    }
}