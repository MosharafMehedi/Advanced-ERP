<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ১. SALARY STRUCTURES TABLE
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->unique()->constrained()->onDelete('cascade');
            
            // Earnings Setup (Percentages based on Gross Salary)
            $table->decimal('basic_percentage', 5, 2)->default(50.00); 
            $table->decimal('house_rent_percentage', 5, 2)->default(30.00); 
            $table->decimal('medical_percentage', 5, 2)->default(10.00); 
            $table->decimal('conveyance_percentage', 5, 2)->default(10.00); 
            
            // Fixed Allowances
            $table->decimal('fixed_allowance', 12, 2)->default(0.00); 
            $table->decimal('mobile_allowance', 12, 2)->default(0.00);
            $table->decimal('internet_allowance', 12, 2)->default(0.00);
            
            // Standard Deductions
            $table->decimal('provident_fund_percentage', 5, 2)->default(0.00); 
            $table->decimal('tax_deduction_fixed', 12, 2)->default(0.00); 
            
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // ২. SALARY SLIPS TABLE
        Schema::create('salary_slips', function (Blueprint $table) {
            $table->id();
            $table->string('salary_slip_no')->unique(); 
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            
            $table->integer('year'); 
            $table->integer('month'); 
            
            // Attendance Summary
            $table->integer('total_days')->default(30);
            $table->integer('working_days')->default(22);
            $table->integer('present_days')->default(22);
            $table->integer('absent_days')->default(0);
            $table->integer('leave_with_pay')->default(0);
            $table->integer('leave_without_pay')->default(0);
            $table->integer('late_days')->default(0);
            
            // Main Financial Figures
            $table->decimal('gross_salary', 12, 2); 
            $table->decimal('total_earnings', 12, 2); 
            $table->decimal('total_deductions', 12, 2); 
            $table->decimal('net_payable', 12, 2); 
            
            // Payment Meta-details
            $table->enum('status', ['Draft', 'Generated', 'Approved', 'Paid', 'Cancelled'])->default('Generated');
            $table->enum('payment_method', ['Bank Transfer', 'Cash', 'Cheque', 'Mobile Banking'])->default('Bank Transfer');
            $table->date('payment_date')->nullable();
            
            // Bank Info Snapshot
            $table->string('bank_name')->nullable();
            $table->string('bank_branch_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('transaction_reference')->nullable(); 
            
            // Logs
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Duplicate Entry Protection
            $table->unique(['employee_id', 'year', 'month']);
        });

        // ৩. SALARY SLIP DETAILS TABLE
        Schema::create('salary_slip_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_slip_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['earnings', 'deductions']); 
            $table->string('component_name'); 
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->string('remarks')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_slip_details');
        Schema::dropIfExists('salary_slips');
        Schema::dropIfExists('salary_structures');
    }
};