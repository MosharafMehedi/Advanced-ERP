```php
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
        Schema::create('employees', function (Blueprint $table) {

            $table->id();

            // User Relation
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Office Information
            $table->string('employee_id')->unique();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reporting_manager_id')
                    ->nullable()
                    ->constrained('employees')
                    ->nullOnDelete();

            $table->enum('employment_type', [
                'Permanent',
                'Contract',
                'Intern',
                'Part Time'
            ])->default('Permanent');

            // Personal Information
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('full_name')->nullable();

            $table->string('email')->nullable()->unique();
            $table->string('phone', 20)->nullable();
            $table->string('alternative_phone', 20)->nullable();

            $table->enum('gender', [
                'Male',
                'Female',
                'Other'
            ])->nullable();

            $table->date('date_of_birth')->nullable();
            $table->string('blood_group')->nullable();

            $table->enum('marital_status', [
                'Single',
                'Married',
                'Divorced',
                'Widowed'
            ])->nullable();

            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('spouse_name')->nullable();

            $table->string('national_id')->nullable();
            $table->string('passport_no')->nullable();

            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');

            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();

            // Employment Dates
            $table->date('joining_date')->nullable();
            $table->date('confirmation_date')->nullable();
            $table->date('resignation_date')->nullable();
            $table->date('termination_date')->nullable();

            // Salary Information
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('gross_salary', 15, 2)->default(0);

            // Banking Information
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_branch')->nullable();
            $table->string('tin_no')->nullable();

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            // Files
            $table->string('profile_photo')->nullable();
            $table->string('joining_letter')->nullable();
            $table->string('cv_file')->nullable();
            $table->string('nid_file')->nullable();
            $table->string('educational_certificate')->nullable();

            // Employee Status
            $table->tinyInteger('status')
                    ->default(1)
                    ->comment('0=Inactive,1=Active,2=Resigned,3=Terminated');
            $table->boolean('has_login_access')->default(true);

            // Audit Fields
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('employee_id');
            $table->index('department_id');
            $table->index('designation_id');
            $table->index('branch_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};