<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'basic_percentage', 'house_rent_percentage', 'medical_percentage', 'conveyance_percentage',
        'fixed_allowance', 'mobile_allowance', 'internet_allowance',
        'provident_fund_percentage', 'tax_deduction_fixed',
        'is_active', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
