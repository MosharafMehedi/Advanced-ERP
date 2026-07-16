<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. SALARY STRUCTURES — per-employee percentage/fixed component config
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->unique()->constrained()->onDelete('cascade');

            // Earnings setup (percentages based on gross salary)
            $table->decimal('basic_percentage', 5, 2)->default(50.00);
            $table->decimal('house_rent_percentage', 5, 2)->default(30.00);
            $table->decimal('medical_percentage', 5, 2)->default(10.00);
            $table->decimal('conveyance_percentage', 5, 2)->default(10.00);

            // Fixed allowances
            $table->decimal('fixed_allowance', 12, 2)->default(0.00);
            $table->decimal('mobile_allowance', 12, 2)->default(0.00);
            $table->decimal('internet_allowance', 12, 2)->default(0.00);

            // Standard deductions
            $table->decimal('provident_fund_percentage', 5, 2)->default(0.00);
            $table->decimal('tax_deduction_fixed', 12, 2)->default(0.00);

            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 2. PAYROLLS — one generated salary slip per employee per month
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string('slip_no')->unique();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');

            $table->integer('year');
            $table->integer('month');

            // Attendance summary
            $table->integer('total_days')->default(30);
            $table->integer('working_days')->default(22);
            $table->integer('present_days')->default(22);
            $table->integer('absent_days')->default(0);
            $table->integer('leave_with_pay')->default(0);
            $table->integer('leave_without_pay')->default(0);
            $table->integer('late_days')->default(0);

            // Adjustments coming from the Create form
            $table->decimal('bonus', 12, 2)->default(0.00);
            $table->decimal('arrears', 12, 2)->default(0.00);
            $table->decimal('fine', 12, 2)->default(0.00);
            $table->decimal('loan_deduction', 12, 2)->default(0.00);

            // Main financial figures (names match the React views)
            $table->decimal('gross_salary', 12, 2);
            $table->decimal('total_allowance', 12, 2);
            $table->decimal('total_deduction', 12, 2);
            $table->decimal('net_payable', 12, 2);

            // Payment meta
            $table->enum('status', ['Draft', 'Generated', 'Approved', 'Paid', 'Cancelled'])->default('Generated');
            $table->enum('payment_method', ['Bank Transfer', 'Cash', 'Cheque', 'Mobile Banking'])->default('Bank Transfer');
            $table->date('payment_date')->nullable();

            // Bank info snapshot
            $table->string('bank_name')->nullable();
            $table->string('bank_branch_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('transaction_reference')->nullable();

            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['employee_id', 'year', 'month']);
        });

        // 3. PAYROLL DETAILS — line items shown on the pay slip
        Schema::create('payroll_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->onDelete('cascade');

            $table->enum('type', ['Allowance', 'Deduction']);
            $table->string('name');
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_details');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('salary_structures');
    }
};
